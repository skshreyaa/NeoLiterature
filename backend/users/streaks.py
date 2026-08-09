from django.utils import timezone


def register_activity(learner_profile):
    today = timezone.localdate()
    last_date = learner_profile.last_activity_date

    if last_date == today:
        return learner_profile

    if last_date == today - timezone.timedelta(days=1):
        learner_profile.current_streak += 1
    else:
        learner_profile.current_streak = 1

    learner_profile.longest_streak = max(learner_profile.longest_streak, learner_profile.current_streak)
    learner_profile.last_activity_date = today
    learner_profile.save()
    return learner_profile