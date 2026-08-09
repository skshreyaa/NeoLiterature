from django.db import models
from django.conf import settings
from curriculum.models import Lesson

LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']


class LearningPathEntry(models.Model):
    STATUS_CHOICES = [('pending', 'Pending'), ('completed', 'Completed'), ('skipped', 'Skipped')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='learning_path')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='path_entries')
    day_number = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['day_number']
        unique_together = ('user', 'lesson', 'day_number')

    def __str__(self):
        return f"{self.user.username} - Day {self.day_number} - {self.lesson.title} ({self.status})"


class LessonActivity(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lesson_activity')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='activity_logs')
    time_spent_minutes = models.PositiveIntegerField(default=0)
    quiz_score = models.FloatField(null=True, blank=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title}"


class ProficiencyPrediction(models.Model):
    SKILL_CHOICES = [('reading', 'Reading'), ('writing', 'Writing'), ('comprehension', 'Comprehension')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='predictions')
    skill = models.CharField(max_length=20, choices=SKILL_CHOICES)
    current_score = models.FloatField()
    predicted_score = models.FloatField()
    predicted_for_days_ahead = models.PositiveIntegerField(default=14)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-generated_at']

    def __str__(self):
        return f"{self.user.username} - {self.skill}: {self.current_score} -> {self.predicted_score}"


class ChatMessage(models.Model):
    ROLE_CHOICES = [('user', 'Learner'), ('assistant', 'Assistant')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username} [{self.role}]: {self.content[:50]}"


class CommunityEvent(models.Model):
    """Auto-logged milestone moments - perfect scores, level-ups, streaks, lab bests."""
    EVENT_TYPES = [
        ('perfect_lesson', 'Perfect lesson score'),
        ('lab_best', 'New lab personal best'),
        ('level_up', 'Leveled up'),
        ('streak_milestone', 'Streak milestone'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_events')
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.description}"


class CommunityPost(models.Model):
    """A real post a learner writes themselves - separate from the
    auto-generated CommunityEvent milestones, merged together in the feed."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='community_posts')
    content = models.CharField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username}: {self.content[:40]}"


class PostReaction(models.Model):
    """A single learner's 'cheer' on a post - one reaction per user per
    post, toggled on/off."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_reactions')
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='reactions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

    def __str__(self):
        return f"{self.user.username} cheered {self.post_id}"


class PostComment(models.Model):
    """A real comment on a CommunityPost - one learner replying to
    another's post, shown in an expandable thread under it."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='post_comments')
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='comments')
    content = models.CharField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.user.username} on post {self.post_id}: {self.content[:30]}"


class ExternalResource(models.Model):
    """
    A real, curated external resource (website, video channel, book source,
    or community) recommended to learners based on their level. Managed via
    Django admin - every entry here is a verified, currently active,
    genuinely appropriate resource, not a placeholder or fabricated link.
    """
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    CATEGORY_CHOICES = [
        ('website', 'Website'),
        ('video', 'Video / Channel'),
        ('book', 'Books'),
        ('community', 'Community'),
    ]
    title = models.CharField(max_length=150)
    description = models.CharField(max_length=255)
    url = models.URLField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['level', 'order']

    def __str__(self):
        return f"[{self.level}] {self.title}"