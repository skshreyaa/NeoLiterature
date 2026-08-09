"""
Adaptive Learning Recommendation Engine.
Primary path: calls Gemini (Google) with the learner's profile plus real
available lessons. Only ever returns lesson IDs, validated against the DB
before storing anything. Fallback: rule-based engine if no API key or the
call/parse fails.
"""
import json
import logging

from decouple import config as decouple_config
from curriculum.models import Lesson

logger = logging.getLogger(__name__)
GEMINI_API_KEY = decouple_config('GEMINI_API_KEY', default='')


def _get_available_lessons_for_level(level_name):
    lessons = Lesson.objects.filter(category__level__name=level_name).select_related('category')
    return [{'id': l.id, 'title': l.title, 'description': l.description, 'category': l.category.name} for l in lessons]


def _build_prompt(profile, lessons):
    return f"""You are recommending lessons for a literacy learner. Only recommend lessons from
AVAILABLE_LESSONS - never invent one.

LEARNER PROFILE:
- Reading: {profile['reading_score']}, Writing: {profile['writing_score']}, Comprehension: {profile['comprehension_score']}
- Level: {profile['overall_level']}, Language: {profile['preferred_language']}, Goal: {profile.get('learning_goal', 'not specified')}

AVAILABLE_LESSONS:
{json.dumps(lessons, indent=2)}

Recommend 5 lessons, most to least urgent, prioritizing the weakest skill. Respond with ONLY this JSON:
{{"recommendations": [{{"lesson_id": <int>, "reason": "<short reason>"}}]}}"""


def _call_llm(prompt):
    """Calls Gemini. Returns the raw text response, or None on failure/no key."""
    if not GEMINI_API_KEY:
        logger.info("No GEMINI_API_KEY set - skipping LLM call, using rule-based fallback.")
        return None
    try:
        from google import genai
        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text
    except Exception as e:
        logger.warning(f"Gemini call failed, falling back to rule-based: {e}")
        return None


def _parse_llm_response(raw_text, valid_ids):
    try:
        cleaned = raw_text.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.split('```')[1]
            if cleaned.startswith('json'):
                cleaned = cleaned[4:]
        parsed = json.loads(cleaned)
        validated = []
        for rec in parsed.get('recommendations', []):
            if rec.get('lesson_id') in valid_ids:
                validated.append({'lesson_id': rec['lesson_id'], 'reason': rec.get('reason', '')})
        return validated
    except Exception as e:
        logger.warning(f"Could not parse Gemini response: {e}")
        return None


def _rule_based_recommendations(profile, lessons):
    scores = {'writing': profile['writing_score'], 'reading': profile['reading_score'], 'comprehension': profile['comprehension_score']}
    weakest = min(scores, key=scores.get)
    keywords = {
        'writing': ['writing', 'sentence', 'grammar', 'paragraph'],
        'reading': ['alphabet', 'reading', 'comprehension', 'vocabulary'],
        'comprehension': ['comprehension', 'reading', 'inference'],
    }[weakest]
    matched = [l for l in lessons if any(kw in l['title'].lower() or kw in l['category'].lower() for kw in keywords)] or lessons
    return [{'lesson_id': l['id'], 'reason': f"Recommended because your {weakest} score ({scores[weakest]}) is your weakest area."} for l in matched[:5]]


def get_recommendations(learner_profile):
    lessons = _get_available_lessons_for_level(learner_profile['overall_level'])
    if not lessons:
        return []
    valid_ids = {l['id'] for l in lessons}
    raw = _call_llm(_build_prompt(learner_profile, lessons))
    if raw:
        validated = _parse_llm_response(raw, valid_ids)
        if validated:
            return validated
    return _rule_based_recommendations(learner_profile, lessons)