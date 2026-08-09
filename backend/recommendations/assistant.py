"""
AI Assistant - a real conversational chat backed by Hugging Face's free
Inference Providers API (OpenAI-compatible chat completion, stable
Bearer-token auth), scoped to literacy learning help. Falls back to a
simple canned response if no API key is set or the call fails.
"""

import logging
import requests
from decouple import config as decouple_config

logger = logging.getLogger(__name__)

HUGGINGFACE_API_KEY = decouple_config("HUGGINGFACE_API_KEY", default="")

FALLBACK_REPLY = (
    "I'm having trouble connecting right now, but I'm still here to help! "
    "Try asking about a specific lesson topic, or head to the Curriculum "
    "page to keep practicing while I get back online."
)

SYSTEM_CONTEXT = """You are the AI Assistant inside NeoLingo, a literacy learning app for
first-time readers and writers. Your job is to help learners with:
- Explaining reading, writing, grammar, or vocabulary questions simply
- Encouraging them and answering questions about their own progress
- Suggesting what to practice next when asked

Keep your answers SHORT (2-4 sentences), use simple everyday words, and be warm and
encouraging - many learners here are building basic literacy skills, so avoid
complicated vocabulary or long paragraphs. If asked something unrelated to learning
or the app, gently redirect back to how you can help with their learning.
"""


def get_assistant_reply(user, new_message, history):
    if not HUGGINGFACE_API_KEY:
        logger.info("No HUGGINGFACE_API_KEY set - using fallback assistant reply.")
        return FALLBACK_REPLY

    profile = user.profile

    learner_context = (
        f"LEARNER CONTEXT: "
        f"Level: {profile.overall_level or 'not yet assessed'}, "
        f"Reading: {profile.reading_score if profile.reading_score is not None else 'N/A'}, "
        f"Writing: {profile.writing_score if profile.writing_score is not None else 'N/A'}, "
        f"Comprehension: {profile.comprehension_score if profile.comprehension_score is not None else 'N/A'}, "
        f"Current streak: {profile.current_streak or 0} days"
    )

    messages = [
        {
            "role": "system",
            "content": f"{SYSTEM_CONTEXT}\n\n{learner_context}",
        }
    ]

    for msg in history:
        role = "user" if msg.role == "user" else "assistant"
        messages.append(
            {
                "role": role,
                "content": msg.content,
            }
        )

    messages.append(
        {
            "role": "user",
            "content": new_message,
        }
    )

    try:
        print("\n========== HUGGING FACE DEBUG ==========")
        print("API Key Loaded:", bool(HUGGINGFACE_API_KEY))
        print("Model:", "meta-llama/Llama-3.2-11B-Vision-Instruct")

        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {HUGGINGFACE_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "Qwen/Qwen2.5-Coder-7B-Instruct",
                "messages": messages,
                "max_tokens": 200,
            },
            timeout=20,
        )

        print("Status Code:", response.status_code)
        print("Response Body:")
        print(response.text)

        response.raise_for_status()

        data = response.json()

        print("========== SUCCESS ==========\n")

        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        print("\n========== HUGGING FACE ERROR ==========")
        print(type(e).__name__)
        print(str(e))

        if "response" in locals():
            print("Status Code:", response.status_code)
            print("Response:")
            print(response.text)

        logger.warning(
            f"Assistant Hugging Face call failed, using fallback: {e}"
        )

        return FALLBACK_REPLY