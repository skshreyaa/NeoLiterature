from rest_framework import serializers
from .models import (
    Level, Category, Lesson, LessonContent, LessonExercise,
    VoicePracticeItem, VoicePracticeAttempt, LabRoundResult,
)


class LessonContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonContent
        fields = ['id', 'language', 'body', 'exercise']


class LessonExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonExercise
        fields = ['id', 'order', 'question_text', 'image_url', 'options']


class LessonSerializer(serializers.ModelSerializer):
    """
    Only returns content/exercises matching the requesting learner's
    preferred_language (or ?language= query param override), falling back to
    English if that lesson hasn't been translated yet.
    """
    contents = serializers.SerializerMethodField()
    exercises = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'order', 'category', 'contents', 'exercises']

    def _get_language(self):
        request = self.context.get('request')
        if not request:
            return 'en'
        query_lang = request.query_params.get('language')
        if query_lang:
            return query_lang
        if request.user and request.user.is_authenticated:
            return request.user.preferred_language
        return 'en'

    def get_contents(self, lesson):
        language = self._get_language()
        contents = lesson.contents.filter(language=language)
        if not contents.exists():
            contents = lesson.contents.filter(language='en')
        return LessonContentSerializer(contents, many=True).data

    def get_exercises(self, lesson):
        language = self._get_language()
        exercises = lesson.exercises.filter(language=language)
        if not exercises.exists():
            exercises = lesson.exercises.filter(language='en')
        return LessonExerciseSerializer(exercises, many=True).data


class CategorySerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'order', 'level', 'lessons']


class LevelSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Level
        fields = ['id', 'name', 'order', 'categories']


class VoicePracticeItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoicePracticeItem
        fields = ['id', 'text', 'image_url', 'order']


class VoicePracticeAttemptSerializer(serializers.ModelSerializer):
    item_text = serializers.CharField(source='item.text', read_only=True)

    class Meta:
        model = VoicePracticeAttempt
        fields = ['id', 'item', 'item_text', 'transcript', 'accuracy', 'attempted_at']
        read_only_fields = ['accuracy', 'attempted_at']


class LabRoundResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabRoundResult
        fields = ['id', 'lab', 'score', 'total', 'best_combo', 'completed_at']