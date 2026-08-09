from django.contrib import admin
from .models import AssessmentQuestion, LearnerResponse, AssessmentResult, AssessmentAttemptLog

@admin.register(AssessmentQuestion)
class AssessmentQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'assessment_type', 'language', 'education_level', 'is_tutorial', 'max_score']
    list_filter = ['assessment_type', 'language', 'education_level', 'is_tutorial']

admin.site.register(LearnerResponse)
admin.site.register(AssessmentResult)

@admin.register(AssessmentAttemptLog)
class AssessmentAttemptLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'assessment_type', 'score', 'attempted_at']
    list_filter = ['assessment_type']