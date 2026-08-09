from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    LANGUAGE_CHOICES = [
        ('en', 'English'),
        ('hi', 'Hindi'),
        ('kn', 'Kannada'),
        ('ta', 'Tamil'),
    ]
    EDUCATION_CHOICES = [
        ('none', 'No formal education'),
        ('primary', 'Primary'),
        ('secondary', 'Secondary'),
        ('other', 'Other'),
    ]
    GOAL_CHOICES = [
        ('personal', 'Personal growth'),
        ('professional', 'Career / work'),
        ('travel', 'Travel'),
        ('family', 'Family & community'),
    ]

    preferred_language = models.CharField(max_length=10, choices=LANGUAGE_CHOICES, default='en')
    age = models.PositiveIntegerField(null=True, blank=True)
    education_level = models.CharField(max_length=20, choices=EDUCATION_CHOICES, default='none')
    learning_goal = models.CharField(max_length=20, choices=GOAL_CHOICES, null=True, blank=True)

    def __str__(self):
        return self.username


class LearnerProfile(models.Model):
    LEVEL_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    reading_score = models.FloatField(null=True, blank=True)
    writing_score = models.FloatField(null=True, blank=True)
    comprehension_score = models.FloatField(null=True, blank=True)
    overall_level = models.CharField(max_length=20, choices=LEVEL_CHOICES, null=True, blank=True)
    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    xp = models.PositiveIntegerField(default=0, help_text="Total experience points earned from completing lessons")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.overall_level or 'Not assessed'}"