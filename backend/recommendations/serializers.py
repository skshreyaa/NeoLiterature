from rest_framework import serializers
from .models import (
    LearningPathEntry, LessonActivity, ProficiencyPrediction, CommunityEvent,
    ChatMessage, CommunityPost, PostComment, ExternalResource,
)
from curriculum.models import Lesson


class LessonMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description']


class LearningPathEntrySerializer(serializers.ModelSerializer):
    lesson = LessonMiniSerializer(read_only=True)

    class Meta:
        model = LearningPathEntry
        fields = ['id', 'lesson', 'day_number', 'status', 'reason', 'created_at', 'completed_at']


class LessonActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonActivity
        fields = ['id', 'lesson', 'time_spent_minutes', 'quiz_score', 'completed_at']
        read_only_fields = ['completed_at']


class ProficiencyPredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProficiencyPrediction
        fields = ['skill', 'current_score', 'predicted_score', 'predicted_for_days_ahead', 'generated_at']


class CommunityEventSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = CommunityEvent
        fields = ['id', 'username', 'event_type', 'description', 'created_at']


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']


class CommunityPostSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    reaction_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    user_has_reacted = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = ['id', 'username', 'content', 'created_at', 'reaction_count', 'comment_count', 'user_has_reacted']

    def get_user_has_reacted(self, post):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return post.reactions.filter(user=request.user).exists()


class PostCommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = PostComment
        fields = ['id', 'username', 'content', 'created_at']


class ExternalResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalResource
        fields = ['id', 'title', 'description', 'url', 'category', 'level']