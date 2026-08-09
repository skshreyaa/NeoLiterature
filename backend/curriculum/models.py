from django.db import models
from django.conf import settings


class Level(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    name = models.CharField(max_length=20, choices=LEVEL_CHOICES, unique=True)
    order = models.PositiveIntegerField(help_text="1=Beginner, 2=Intermediate, 3=Advanced")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class Category(models.Model):
    level = models.ForeignKey(Level, on_delete=models.CASCADE, related_name='categories')
    name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ('level', 'name')

    def __str__(self):
        return f"{self.level.name} - {self.name}"


class Lesson(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class LessonContent(models.Model):
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('kn', 'Kannada'),
        ('ta', 'Tamil'),
    ]
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='contents')
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES)
    body = models.TextField()
    exercise = models.TextField(blank=True)

    class Meta:
        unique_together = ('lesson', 'language')

    def __str__(self):
        return f"{self.lesson.title} ({self.language})"


class LessonExercise(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='exercises')
    language = models.CharField(max_length=10, choices=LessonContent.LANGUAGE_CHOICES, default='en')
    order = models.PositiveIntegerField(default=0)
    question_text = models.TextField()
    image_url = models.URLField(blank=True, max_length=5000)
    options = models.JSONField()
    correct_answer = models.CharField(max_length=255)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.lesson.title} - exercise {self.order}"


class VoicePracticeItem(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    language = models.CharField(max_length=10, choices=LessonContent.LANGUAGE_CHOICES, default='en')
    text = models.CharField(max_length=255, help_text="The word or phrase the learner should say")
    image_url = models.URLField(blank=True, help_text="Optional image to give context for what they're saying")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"[{self.level}/{self.language}] {self.text}"


class VoicePracticeAttempt(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='voice_attempts')
    item = models.ForeignKey(VoicePracticeItem, on_delete=models.CASCADE, related_name='attempts')
    transcript = models.TextField(blank=True)
    accuracy = models.FloatField(help_text="0-100, word-overlap match against the target text")
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-attempted_at']

    def __str__(self):
        return f"{self.user.username} - {self.item.text} ({self.accuracy}%)"


class LabRoundResult(models.Model):
    """
    Shared completion log for Picture Lab and Listening Lab rounds - powers
    personal-best tracking and XP rewards for these labs, the same way
    VoicePracticeAttempt does for Voice Lab.
    """
    LAB_CHOICES = [
        ('picture', 'Picture Lab'),
        ('listening', 'Listening Lab'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lab_round_results')
    lab = models.CharField(max_length=20, choices=LAB_CHOICES)
    score = models.PositiveIntegerField(help_text="Number correct")
    total = models.PositiveIntegerField(help_text="Total questions in the round")
    best_combo = models.PositiveIntegerField(default=0, help_text="Longest streak of correct answers in a row")
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.user.username} - {self.lab}: {self.score}/{self.total}"


class PictureLabItem(models.Model):
    """
    Dedicated real-picture content for Picture Lab - genuine photos and
    object illustrations, deliberately separate from LessonExercise images
    (which are mostly letter/color-word/number flashcards for the reading
    curriculum, not actual pictures of things).
    """
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    language = models.CharField(max_length=10, choices=LessonContent.LANGUAGE_CHOICES, default='en')
    image_url = models.URLField(max_length=5000)
    correct_answer = models.CharField(max_length=255, help_text="What the picture actually shows")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"[{self.level}/{self.language}] {self.correct_answer}"