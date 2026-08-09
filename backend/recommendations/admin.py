from django.contrib import admin
from .models import (
    LearningPathEntry, LessonActivity, ProficiencyPrediction, CommunityEvent,
    ChatMessage, CommunityPost, PostReaction, PostComment, ExternalResource,
)

@admin.register(LearningPathEntry)
class LearningPathEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'day_number', 'lesson', 'status', 'reason']
    list_filter = ['status', 'day_number']

@admin.register(LessonActivity)
class LessonActivityAdmin(admin.ModelAdmin):
    list_display = ['user', 'lesson', 'time_spent_minutes', 'quiz_score', 'completed_at']

@admin.register(ProficiencyPrediction)
class ProficiencyPredictionAdmin(admin.ModelAdmin):
    list_display = ['user', 'skill', 'current_score', 'predicted_score', 'generated_at']
    list_filter = ['skill']

@admin.register(CommunityEvent)
class CommunityEventAdmin(admin.ModelAdmin):
    list_display = ['user', 'event_type', 'description', 'created_at']
    list_filter = ['event_type']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'content', 'created_at']
    list_filter = ['role']

@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ['user', 'content', 'created_at']

@admin.register(PostReaction)
class PostReactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'created_at']

@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'content', 'created_at']

@admin.register(ExternalResource)
class ExternalResourceAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'level', 'url', 'order']
    list_filter = ['level', 'category']