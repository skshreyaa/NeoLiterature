"""
XP (experience points) system. Awarded when a learner actually completes a
lesson's real exercises, or practices in one of the labs - never for just
clicking a button. Also defines the rank tiers shown on the Profile page.
"""

RANK_TIERS = [
    (0, "Seedling", "🌱"),
    (100, "Sprout", "🌿"),
    (300, "Sapling", "🌳"),
    (600, "Grove Keeper", "🌲"),
    (1000, "Forest Guardian", "🏞️"),
    (2000, "Grove Master", "🏆"),
]


def award_lesson_xp(learner_profile, quiz_score=None):
    """
    Base 20 XP for finishing a lesson, plus up to 30 more scaled by how many
    exercises were answered correctly (quiz_score is 0-100).
    """
    base_xp = 20
    accuracy_bonus = round((quiz_score or 0) * 0.3)
    earned = base_xp + accuracy_bonus

    learner_profile.xp += earned
    learner_profile.save()
    return earned


def award_lab_xp(learner_profile, score, total):
    """
    Smaller XP reward for lab practice rounds (Voice/Picture/Listening Lab) -
    labs are meant to be replayed often, so each round earns less than a
    full lesson, but repeated practice adds up. Scaled by accuracy in the
    round, with a small flat bonus just for completing it.
    """
    if total <= 0:
        return 0
    accuracy_ratio = score / total
    earned = round(5 + accuracy_ratio * 10)  # 5-15 XP per round

    learner_profile.xp += earned
    learner_profile.save()
    return earned


def award_voice_xp(learner_profile, accuracy):
    """XP for a single Voice Lab attempt, scaled by pronunciation accuracy (0-100)."""
    earned = round(2 + (accuracy / 100) * 6)  # 2-8 XP per attempt
    learner_profile.xp += earned
    learner_profile.save()
    return earned


def get_rank(xp):
    """Returns rank info dict for the given total XP."""
    current = RANK_TIERS[0]
    next_tier = None
    for i, tier in enumerate(RANK_TIERS):
        threshold, name, icon = tier
        if xp >= threshold:
            current = tier
            next_tier = RANK_TIERS[i + 1] if i + 1 < len(RANK_TIERS) else None
        else:
            break

    threshold, name, icon = current
    next_threshold = next_tier[0] if next_tier else None
    return {
        'name': name,
        'icon': icon,
        'xp': xp,
        'current_tier_threshold': threshold,
        'next_tier_threshold': next_threshold,
        'next_tier_name': next_tier[1] if next_tier else None,
    }