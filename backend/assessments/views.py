from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AssessmentQuestion, AssessmentType, AssessmentAttemptLog
from .serializers import AssessmentQuestionSerializer, LearnerResponseSerializer, AssessmentResultSerializer, AssessmentAttemptLogSerializer
from .scoring import score_response, compute_assessment_result, update_learner_profile


class AssessmentQuestionListView(generics.ListAPIView):
    serializer_class = AssessmentQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = AssessmentQuestion.objects.all()
        atype = self.request.query_params.get('type')
        language = self.request.query_params.get('language') or self.request.user.preferred_language
        education_level = self.request.query_params.get('education_level') or self.request.user.education_level
        tutorial_param = self.request.query_params.get('tutorial', 'false').lower() == 'true'
        if atype:
            qs = qs.filter(assessment_type=atype)
        qs = qs.filter(language=language, education_level=education_level, is_tutorial=tutorial_param)
        return qs


class SubmitResponseView(generics.CreateAPIView):
    serializer_class = LearnerResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        response = serializer.save(user=self.request.user)
        score_response(response)


class FinalizeAssessmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        assessment_type = request.data.get('assessment_type')
        if assessment_type not in AssessmentType.values:
            return Response({'error': 'Invalid assessment_type'}, status=400)
        result = compute_assessment_result(request.user, assessment_type)
        profile = update_learner_profile(request.user)
        return Response({
            'assessment_result': AssessmentResultSerializer(result).data,
            'reading_score': profile.reading_score,
            'writing_score': profile.writing_score,
            'comprehension_score': profile.comprehension_score,
            'overall_level': profile.overall_level,
        })


class TestResultHistoryView(generics.ListAPIView):
    serializer_class = AssessmentAttemptLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AssessmentAttemptLog.objects.filter(user=self.request.user)