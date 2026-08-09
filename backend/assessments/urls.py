from django.urls import path
from .views import AssessmentQuestionListView, SubmitResponseView, FinalizeAssessmentView, TestResultHistoryView

urlpatterns = [
    path('questions/', AssessmentQuestionListView.as_view(), name='assessment-questions'),
    path('submit/', SubmitResponseView.as_view(), name='assessment-submit'),
    path('finalize/', FinalizeAssessmentView.as_view(), name='assessment-finalize'),
    path('history/', TestResultHistoryView.as_view(), name='assessment-history'),
]