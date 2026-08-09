from django.contrib import admin
from .models import (
    Level, Category, Lesson, LessonContent, LessonExercise,
    VoicePracticeItem, VoicePracticeAttempt, LabRoundResult, PictureLabItem,
)

admin.site.register(Level)
admin.site.register(Category)
admin.site.register(Lesson)
admin.site.register(LessonContent)

@admin.register(LessonExercise)
class LessonExerciseAdmin(admin.ModelAdmin):
    list_display = ['lesson', 'order', 'question_text', 'language']
    list_filter = ['language']

@admin.register(VoicePracticeItem)
class VoicePracticeItemAdmin(admin.ModelAdmin):
    list_display = ['text', 'level', 'language', 'order']
    list_filter = ['level', 'language']

@admin.register(VoicePracticeAttempt)
class VoicePracticeAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'item', 'accuracy', 'attempted_at']

@admin.register(LabRoundResult)
class LabRoundResultAdmin(admin.ModelAdmin):
    list_display = ['user', 'lab', 'score', 'total', 'best_combo', 'completed_at']
    list_filter = ['lab']

@admin.register(PictureLabItem)
class PictureLabItemAdmin(admin.ModelAdmin):
    list_display = ['correct_answer', 'level', 'language', 'order']
    list_filter = ['level', 'language']