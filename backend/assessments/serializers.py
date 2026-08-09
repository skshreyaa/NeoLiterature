from rest_framework import serializers
from .models import AssessmentQuestion, LearnerResponse, AssessmentResult, AssessmentAttemptLog


class AssessmentQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentQuestion
        fields = ['id', 'assessment_type', 'language', 'education_level', 'is_tutorial',
                  'passage', 'question_text', 'image_url', 'options', 'max_score']


class LearnerResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnerResponse
        fields = ['id', 'question', 'answer_text', 'score_awarded', 'submitted_at']
        read_only_fields = ['score_awarded', 'submitted_at']


class AssessmentResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentResult
        fields = ['assessment_type', 'score', 'completed_at']


class AssessmentAttemptLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AssessmentAttemptLog
        fields = ['assessment_type', 'score', 'attempted_at']