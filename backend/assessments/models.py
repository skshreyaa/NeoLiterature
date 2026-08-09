from django.db import models
from django.conf import settings

LANGUAGE_CHOICES = [
    ('en', 'English'), ('hi', 'Hindi'), ('kn', 'Kannada'), ('ta', 'Tamil'),
]
EDUCATION_CHOICES = [
    ('none', 'No formal education'), ('primary', 'Primary'),
    ('secondary', 'Secondary'), ('other', 'Other'),
]


class AssessmentType(models.TextChoices):
    READING = 'reading', 'Reading'
    WRITING = 'writing', 'Writing'
    COMPREHENSION = 'comprehension', 'Comprehension'


class AssessmentQuestion(models.Model):
    assessment_type = models.CharField(max_length=20, choices=AssessmentType.choices)
    language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, default='secondary')
    is_tutorial = models.BooleanField(default=False)
    passage = models.TextField(blank=True)
    question_text = models.TextField()
    image_url = models.URLField(blank=True)
    options = models.JSONField(null=True, blank=True)
    correct_answer = models.CharField(max_length=255, blank=True)
    max_score = models.PositiveIntegerField(default=10)

    def __str__(self):
        tag = " [tutorial]" if self.is_tutorial else ""
        return f"[{self.assessment_type}/{self.language}/{self.education_level}]{tag} {self.question_text[:40]}"


class LearnerResponse(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='responses')
    question = models.ForeignKey(AssessmentQuestion, on_delete=models.CASCADE, related_name='responses')
    answer_text = models.TextField()
    score_awarded = models.FloatField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - Q{self.question_id}"


class AssessmentResult(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='assessment_results')
    assessment_type = models.CharField(max_length=20, choices=AssessmentType.choices)
    score = models.FloatField()
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'assessment_type')

    def __str__(self):
        return f"{self.user.username} - {self.assessment_type}: {self.score}"


class AssessmentAttemptLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='attempt_history')
    assessment_type = models.CharField(max_length=20, choices=AssessmentType.choices)
    score = models.FloatField()
    attempted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-attempted_at']

    def __str__(self):
        return f"{self.user.username} - {self.assessment_type}: {self.score}"