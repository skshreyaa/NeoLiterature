from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    LevelViewSet, CategoryViewSet, LessonViewSet, LessonContentViewSet, CheckExerciseAnswerView,
    VoiceLabItemsView, VoiceLabSubmitView, VoiceLabStatsView,
    PictureLabView, PictureLabCheckView, PictureLabCompleteView, PictureLabStatsView,
    ListeningLabItemsView, ListeningLabCheckView, ListeningLabCompleteView, ListeningLabStatsView,
)

router = DefaultRouter()
router.register('levels', LevelViewSet)
router.register('categories', CategoryViewSet)
router.register('lessons', LessonViewSet)
router.register('content', LessonContentViewSet)

urlpatterns = router.urls + [
    path('exercises/check/', CheckExerciseAnswerView.as_view(), name='check-exercise-answer'),

    path('voice-lab/items/', VoiceLabItemsView.as_view(), name='voice-lab-items'),
    path('voice-lab/submit/', VoiceLabSubmitView.as_view(), name='voice-lab-submit'),
    path('voice-lab/stats/', VoiceLabStatsView.as_view(), name='voice-lab-stats'),

    path('picture-lab/', PictureLabView.as_view(), name='picture-lab'),
    path('picture-lab/check/', PictureLabCheckView.as_view(), name='picture-lab-check'),
    path('picture-lab/complete/', PictureLabCompleteView.as_view(), name='picture-lab-complete'),
    path('picture-lab/stats/', PictureLabStatsView.as_view(), name='picture-lab-stats'),

    path('listening-lab/items/', ListeningLabItemsView.as_view(), name='listening-lab-items'),
    path('listening-lab/check/', ListeningLabCheckView.as_view(), name='listening-lab-check'),
    path('listening-lab/complete/', ListeningLabCompleteView.as_view(), name='listening-lab-complete'),
    path('listening-lab/stats/', ListeningLabStatsView.as_view(), name='listening-lab-stats'),
]