from django.urls import path
from .views import (
    RecommendationsView, LearningPathView, CompleteLessonView,
    PredictionsView, LogLessonActivityView, LevelProgressView, LevelUpView,
    CompletedLessonsView, LeaderboardView, LessonStatsView, AchievementsView,
    CommunityFeedView, CommunityPostCreateView, PostReactionToggleView, PostCommentListCreateView,
    AssistantChatView, AssistantHistoryView, AssistantClearView,
    PredictionsInsightsView, ExternalResourcesView,
)

urlpatterns = [
    path('recommendations/', RecommendationsView.as_view(), name='recommendations'),
    path('learning-path/', LearningPathView.as_view(), name='learning-path'),
    path('learning-path/complete/', CompleteLessonView.as_view(), name='learning-path-complete'),
    path('learning-path/log-activity/', LogLessonActivityView.as_view(), name='log-lesson-activity'),
    path('predictions/', PredictionsView.as_view(), name='predictions'),
    path('predictions/insights/', PredictionsInsightsView.as_view(), name='predictions-insights'),
    path('level-progress/', LevelProgressView.as_view(), name='level-progress'),
    path('level-up/', LevelUpView.as_view(), name='level-up'),
    path('completed-lessons/', CompletedLessonsView.as_view(), name='completed-lessons'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    path('lesson-stats/', LessonStatsView.as_view(), name='lesson-stats'),
    path('achievements/', AchievementsView.as_view(), name='achievements'),
    path('community/feed/', CommunityFeedView.as_view(), name='community-feed'),
    path('community/posts/', CommunityPostCreateView.as_view(), name='community-post-create'),
    path('community/posts/<int:post_id>/react/', PostReactionToggleView.as_view(), name='community-post-react'),
    path('community/posts/<int:post_id>/comments/', PostCommentListCreateView.as_view(), name='community-post-comments'),
    path('assistant/chat/', AssistantChatView.as_view(), name='assistant-chat'),
    path('assistant/history/', AssistantHistoryView.as_view(), name='assistant-history'),
    path('assistant/clear/', AssistantClearView.as_view(), name='assistant-clear'),
    path('community/resources/', ExternalResourcesView.as_view(), name='community-resources'),
]