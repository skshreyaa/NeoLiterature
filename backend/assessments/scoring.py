from django.db.models import Sum
from users.models import LearnerProfile
from users.streaks import register_activity
from .models import LearnerResponse, AssessmentResult, AssessmentType, AssessmentAttemptLog


def score_response(response):
    question = response.question
    if question.correct_answer:
        response.score_awarded = question.max_score if (
            response.answer_text.strip().lower() == question.correct_answer.strip().lower()
        ) else 0
    elif question.assessment_type == AssessmentType.READING and question.passage:
        passage_words = set(question.passage.lower().split())
        transcript_words = set(response.answer_text.lower().split())
        overlap_ratio = len(passage_words & transcript_words) / len(passage_words) if passage_words else 0
        response.score_awarded = round(question.max_score * overlap_ratio, 2)
    else:
        word_count = len(response.answer_text.strip().split())
        completion_ratio = min(1, word_count / 20)
        response.score_awarded = round(question.max_score * completion_ratio, 2)
    response.save()
    return response.score_awarded


def compute_assessment_result(user, assessment_type):
    responses = LearnerResponse.objects.filter(
        user=user, question__assessment_type=assessment_type, question__is_tutorial=False)
    total_possible = sum(r.question.max_score for r in responses) or 1
    total_scored = responses.aggregate(total=Sum('score_awarded'))['total'] or 0
    percentage = round((total_scored / total_possible) * 100, 2)

    result, _ = AssessmentResult.objects.update_or_create(
        user=user, assessment_type=assessment_type, defaults={'score': percentage})
    AssessmentAttemptLog.objects.create(user=user, assessment_type=assessment_type, score=percentage)
    return result


def level_from_score(score):
    if score <= 40:
        return 'beginner'
    elif score <= 70:
        return 'intermediate'
    return 'advanced'


def update_learner_profile(user):
    results = {r.assessment_type: r.score for r in AssessmentResult.objects.filter(user=user)}
    reading = results.get(AssessmentType.READING)
    writing = results.get(AssessmentType.WRITING)
    comprehension = results.get(AssessmentType.COMPREHENSION)
    scores = [s for s in [reading, writing, comprehension] if s is not None]
    overall_score = sum(scores) / len(scores) if scores else 0
    overall_level = level_from_score(overall_score)

    profile, _ = LearnerProfile.objects.update_or_create(
        user=user,
        defaults={'reading_score': reading, 'writing_score': writing,
                  'comprehension_score': comprehension, 'overall_level': overall_level})
    register_activity(profile)
    return profile