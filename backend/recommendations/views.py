import math
from datetime import timedelta

from django.db.models import Avg, Sum, Count, Min
from django.utils import timezone
from rest_framework import permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from curriculum.models import Lesson
from assessments.models import AssessmentAttemptLog
from .models import (
    LearningPathEntry, LessonActivity, ProficiencyPrediction, LEVEL_ORDER, CommunityEvent,
    ChatMessage, CommunityPost, PostReaction, PostComment, ExternalResource,
)
from .serializers import (
    LearningPathEntrySerializer, ProficiencyPredictionSerializer, CommunityEventSerializer,
    ChatMessageSerializer, CommunityPostSerializer, PostCommentSerializer, ExternalResourceSerializer,
)
from .engine import get_recommendations
from .prediction import predict_future_score
from .assistant import get_assistant_reply

STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]


def _build_learner_profile(user):
    profile = user.profile
    return {
        'reading_score': profile.reading_score or 0,
        'writing_score': profile.writing_score or 0,
        'comprehension_score': profile.comprehension_score or 0,
        'overall_level': profile.overall_level or 'beginner',
        'preferred_language': user.preferred_language,
        'learning_goal': user.learning_goal,
    }


def _level_progress_for(user):
    profile = user.profile
    level = profile.overall_level or 'beginner'
    all_lesson_ids = list(Lesson.objects.filter(category__level__name=level).values_list('id', flat=True))
    total_lessons = len(all_lesson_ids)
    completed_lesson_ids = set(
        LessonActivity.objects.filter(user=user, lesson_id__in=all_lesson_ids).values_list('lesson_id', flat=True))
    completed_count = len(completed_lesson_ids)
    all_complete = total_lessons > 0 and completed_count >= total_lessons
    current_index = LEVEL_ORDER.index(level) if level in LEVEL_ORDER else 0
    next_level = LEVEL_ORDER[current_index + 1] if current_index + 1 < len(LEVEL_ORDER) else None
    return {'level': level, 'total_lessons': total_lessons, 'completed_lessons': completed_count,
            'all_complete': all_complete, 'next_level': next_level}


def _estimate_days_to_finish_level(user, progress):
    remaining = progress['total_lessons'] - progress['completed_lessons']
    if remaining <= 0:
        return {'remaining_lessons': 0, 'estimated_days': 0, 'pace_per_day': None}
    first_activity = LessonActivity.objects.filter(user=user).aggregate(first=Min('completed_at'))['first']
    completed_count = LessonActivity.objects.filter(user=user).values('lesson_id').distinct().count()
    if not first_activity or completed_count == 0:
        estimated_days = remaining
        pace_per_day = None
    else:
        days_active = max(1, (timezone.now() - first_activity).days + 1)
        pace_per_day = completed_count / days_active
        pace_per_day = max(pace_per_day, 0.1)
        estimated_days = math.ceil(remaining / pace_per_day)
    return {'remaining_lessons': remaining, 'estimated_days': estimated_days,
            'pace_per_day': round(pace_per_day, 2) if pace_per_day else None}


def _maybe_log_streak_milestone(user, profile):
    if profile.current_streak in STREAK_MILESTONES:
        CommunityEvent.objects.create(
            user=user, event_type='streak_milestone', description=f"hit a {profile.current_streak}-day streak 🔥")


class RecommendationsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.overall_level is None:
            return Response({'error': 'Complete your assessment first to get recommendations.'}, status=400)
        profile = _build_learner_profile(request.user)
        recs = get_recommendations(profile)
        ids = [r['lesson_id'] for r in recs]
        lessons_by_id = {l.id: l for l in Lesson.objects.filter(id__in=ids)}
        result = []
        for rec in recs:
            lesson = lessons_by_id.get(rec['lesson_id'])
            if lesson:
                result.append({'lesson_id': lesson.id, 'title': lesson.title,
                                'description': lesson.description, 'reason': rec['reason']})
        return Response(result)


class LearningPathView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        entries = LearningPathEntry.objects.filter(user=request.user).select_related('lesson')
        return Response(LearningPathEntrySerializer(entries, many=True).data)

    def post(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.overall_level is None:
            return Response({'error': 'Complete your assessment first to generate a learning path.'}, status=400)
        LearningPathEntry.objects.filter(user=request.user, status='pending').delete()
        profile = _build_learner_profile(request.user)
        recs = get_recommendations(profile)
        ids = [r['lesson_id'] for r in recs]
        lessons_by_id = {l.id: l for l in Lesson.objects.filter(id__in=ids)}
        created = []
        for day, rec in enumerate(recs, start=1):
            lesson = lessons_by_id.get(rec['lesson_id'])
            if not lesson:
                continue
            entry, _ = LearningPathEntry.objects.update_or_create(
                user=request.user, lesson=lesson, day_number=day,
                defaults={'reason': rec['reason'], 'status': 'pending'})
            created.append(entry)
        return Response(LearningPathEntrySerializer(created, many=True).data, status=201)


class CompleteLessonView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request):
        entry_id = request.data.get('entry_id')
        time_spent = request.data.get('time_spent_minutes', 0)
        quiz_score = request.data.get('quiz_score')
        try:
            entry = LearningPathEntry.objects.get(id=entry_id, user=request.user)
        except LearningPathEntry.DoesNotExist:
            return Response({'error': 'Learning path entry not found.'}, status=404)
        entry.status = 'completed'
        entry.completed_at = timezone.now()
        entry.save()
        LessonActivity.objects.create(user=request.user, lesson=entry.lesson,
                                       time_spent_minutes=time_spent, quiz_score=quiz_score)
        from users.streaks import register_activity
        from users.xp import award_lesson_xp
        register_activity(request.user.profile)
        xp_earned = award_lesson_xp(request.user.profile, quiz_score)
        _maybe_log_streak_milestone(request.user, request.user.profile)
        if quiz_score == 100:
            CommunityEvent.objects.create(user=request.user, event_type='perfect_lesson',
                                           description=f"scored 100% on {entry.lesson.title}")
        return Response({'status': 'completed', 'entry_id': entry.id, 'xp_earned': xp_earned})


class LogLessonActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        lesson_id = request.data.get('lesson_id')
        time_spent = request.data.get('time_spent_minutes', 0)
        quiz_score = request.data.get('quiz_score')
        try:
            lesson = Lesson.objects.get(id=lesson_id)
        except Lesson.DoesNotExist:
            return Response({'error': 'Lesson not found.'}, status=404)
        LessonActivity.objects.create(user=request.user, lesson=lesson,
                                       time_spent_minutes=time_spent, quiz_score=quiz_score)
        from users.streaks import register_activity
        from users.xp import award_lesson_xp
        register_activity(request.user.profile)
        xp_earned = award_lesson_xp(request.user.profile, quiz_score)
        _maybe_log_streak_milestone(request.user, request.user.profile)
        if quiz_score == 100:
            CommunityEvent.objects.create(user=request.user, event_type='perfect_lesson',
                                           description=f"scored 100% on {lesson.title}")
        return Response({'status': 'logged', 'xp_earned': xp_earned})


class PredictionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.overall_level is None:
            return Response({'error': 'Complete your assessment first to see predictions.'}, status=400)
        profile = request.user.profile
        activity = LessonActivity.objects.filter(user=request.user).aggregate(
            lessons_completed=Count('id'), total_minutes=Sum('time_spent_minutes'), avg_quiz_score=Avg('quiz_score'))
        lessons_completed = activity['lessons_completed'] or 0
        practice_minutes = activity['total_minutes'] or 0
        avg_quiz_score = activity['avg_quiz_score'] or 50
        skills = {'reading': profile.reading_score, 'writing': profile.writing_score, 'comprehension': profile.comprehension_score}
        score_predictions = []
        for skill, current in skills.items():
            if current is None:
                continue
            predicted = predict_future_score(current, lessons_completed, practice_minutes, avg_quiz_score)
            milestone = None
            if current <= 40 < predicted:
                milestone = "This would move you from Beginner into Intermediate range."
            elif current <= 70 < predicted:
                milestone = "This would move you from Intermediate into Advanced range."
            obj = ProficiencyPrediction.objects.create(
                user=request.user, skill=skill, current_score=current,
                predicted_score=predicted, predicted_for_days_ahead=14)
            data = ProficiencyPredictionSerializer(obj).data
            data['milestone'] = milestone
            score_predictions.append(data)
        historical_trend = {}
        for skill in ['reading', 'writing', 'comprehension']:
            attempts = (AssessmentAttemptLog.objects.filter(user=request.user, assessment_type=skill)
                        .order_by('attempted_at').values('attempted_at', 'score'))
            historical_trend[skill] = [{'date': a['attempted_at'].strftime('%b %d'), 'score': a['score']} for a in attempts]
        level_progress = _level_progress_for(request.user)
        completion_forecast = _estimate_days_to_finish_level(request.user, level_progress)
        return Response({
            'score_predictions': score_predictions,
            'historical_trend': historical_trend,
            'completion_forecast': {**completion_forecast, 'level': level_progress['level']},
        })


class LevelProgressView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(_level_progress_for(request.user))


class LevelUpView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        progress = _level_progress_for(request.user)
        if not progress['all_complete']:
            return Response({'error': 'You have not completed all lessons in your current level yet.'}, status=400)
        if not progress['next_level']:
            return Response({'error': 'You are already at the highest level.'}, status=400)
        profile = request.user.profile
        profile.overall_level = progress['next_level']
        profile.save()
        CommunityEvent.objects.create(user=request.user, event_type='level_up',
                                       description=f"leveled up to {progress['next_level'].capitalize()} 🎉")
        return Response({'status': 'leveled up', 'new_level': profile.overall_level})


class CompletedLessonsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        completed_ids = list(LessonActivity.objects.filter(user=request.user).values_list('lesson_id', flat=True).distinct())
        return Response({'completed_lesson_ids': completed_ids})


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from users.models import LearnerProfile
        ranked = list(LearnerProfile.objects.filter(xp__gt=0).select_related('user').order_by('-xp', 'user__date_joined'))
        top_10 = [{'rank': i + 1, 'username': p.user.username, 'xp': p.xp, 'is_you': p.user_id == request.user.id}
                  for i, p in enumerate(ranked[:10])]
        your_entry = next((entry for entry in top_10 if entry['is_you']), None)
        if not your_entry:
            your_rank = next((i + 1 for i, p in enumerate(ranked) if p.user_id == request.user.id), None)
            if your_rank:
                your_profile = next(p for p in ranked if p.user_id == request.user.id)
                your_entry = {'rank': your_rank, 'username': request.user.username, 'xp': your_profile.xp, 'is_you': True}
        return Response({'top_10': top_10, 'your_entry': your_entry, 'total_ranked_learners': len(ranked)})


class AchievementsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        lessons_completed = LessonActivity.objects.filter(user=request.user).values('lesson_id').distinct().count()
        perfect_lessons = LessonActivity.objects.filter(user=request.user, quiz_score=100).count()
        try:
            from curriculum.models import VoicePracticeAttempt
            voice_attempts = VoicePracticeAttempt.objects.filter(user=request.user).count()
        except Exception:
            voice_attempts = 0
        badges = [
            {'id': 'first_lesson', 'name': 'First Steps', 'icon': '🌱', 'description': 'Complete your first lesson', 'earned': lessons_completed >= 1},
            {'id': 'five_lessons', 'name': 'Getting Started', 'icon': '📚', 'description': 'Complete 5 lessons', 'earned': lessons_completed >= 5},
            {'id': 'fifteen_lessons', 'name': 'Dedicated Learner', 'icon': '🎓', 'description': 'Complete 15 lessons', 'earned': lessons_completed >= 15},
            {'id': 'three_day_streak', 'name': '3-Day Streak', 'icon': '🔥', 'description': 'Keep a 3-day streak going', 'earned': (profile.longest_streak or 0) >= 3},
            {'id': 'week_streak', 'name': 'Week Warrior', 'icon': '⚡', 'description': 'Keep a 7-day streak going', 'earned': (profile.longest_streak or 0) >= 7},
            {'id': 'perfect_score', 'name': 'Perfect Score', 'icon': '💯', 'description': 'Get 100% on a lesson', 'earned': perfect_lessons >= 1},
            {'id': 'voice_practitioner', 'name': 'Voice Practitioner', 'icon': '🎙️', 'description': 'Practice 10 phrases in the Voice Lab', 'earned': voice_attempts >= 10},
            {'id': 'xp_100', 'name': 'Sprout', 'icon': '🌿', 'description': 'Earn 100 XP', 'earned': (profile.xp or 0) >= 100},
        ]
        earned_count = sum(1 for b in badges if b['earned'])
        return Response({'badges': badges, 'earned_count': earned_count, 'total_count': len(badges)})


class LessonStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        activities = LessonActivity.objects.filter(user=request.user)
        totals = activities.aggregate(total_lessons=Count('id'), total_minutes=Sum('time_spent_minutes'), avg_accuracy=Avg('quiz_score'))
        today = timezone.localdate()
        daily_counts = []
        for i in range(13, -1, -1):
            day = today - timedelta(days=i)
            count = activities.filter(completed_at__date=day).count()
            daily_counts.append({'date': day.strftime('%b %d'), 'lessons': count})
        best_day = max(daily_counts, key=lambda d: d['lessons']) if daily_counts else None
        return Response({
            'total_lessons_completed': totals['total_lessons'] or 0,
            'total_minutes_practiced': totals['total_minutes'] or 0,
            'average_accuracy': round(totals['avg_accuracy'], 1) if totals['avg_accuracy'] else None,
            'daily_activity': daily_counts,
            'best_day': best_day if best_day and best_day['lessons'] > 0 else None,
        })


class CommunityFeedView(APIView):
    """
    GET /api/community/feed/
    Merges real user posts and auto-logged milestone events into one
    chronological feed, most recent first. Posts carry a reaction count and
    whether the requesting learner has already cheered it.

    IMPORTANT: both event and post timestamps are normalized to ISO strings
    BEFORE sorting - mixing raw datetime objects with serializer-produced
    strings caused a silent 500 error whenever both an event and a post
    existed together (Python can't compare datetime to str).
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        events = CommunityEvent.objects.select_related('user')[:30]
        posts = CommunityPost.objects.select_related('user').annotate(
            reaction_count=Count('reactions', distinct=True),
            comment_count=Count('comments', distinct=True),
        )[:30]

        event_items = [
            {'kind': 'event', 'id': f"event-{e.id}", 'username': e.user.username,
             'description': e.description, 'event_type': e.event_type,
             'created_at': e.created_at.isoformat()}
            for e in events
        ]
        post_data = CommunityPostSerializer(posts, many=True, context={'request': request}).data
        post_items = [{**p, 'kind': 'post', 'id': f"post-{p['id']}", '_raw_id': p['id']} for p in post_data]

        combined = event_items + post_items
        combined.sort(key=lambda item: item['created_at'], reverse=True)
        return Response(combined[:30])


class CommunityPostCreateView(APIView):
    """POST /api/community/posts/  body: {content}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Post cannot be empty.'}, status=400)
        if len(content) > 280:
            return Response({'error': 'Keep it under 280 characters.'}, status=400)
        post = CommunityPost.objects.create(user=request.user, content=content)
        post.reaction_count = 0
        post.comment_count = 0
        return Response(CommunityPostSerializer(post, context={'request': request}).data, status=201)


class PostReactionToggleView(APIView):
    """POST /api/community/posts/<id>/react/ - toggles a cheer reaction on/off."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = CommunityPost.objects.get(id=post_id)
        except CommunityPost.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=404)

        existing = PostReaction.objects.filter(user=request.user, post=post).first()
        if existing:
            existing.delete()
            reacted = False
        else:
            PostReaction.objects.create(user=request.user, post=post)
            reacted = True

        count = post.reactions.count()
        return Response({'reaction_count': count, 'user_has_reacted': reacted})


class PostCommentListCreateView(APIView):
    """
    GET  /api/community/posts/<id>/comments/  - list comments on a post
    POST /api/community/posts/<id>/comments/  - add a comment  body: {content}
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, post_id):
        try:
            post = CommunityPost.objects.get(id=post_id)
        except CommunityPost.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=404)
        comments = PostComment.objects.filter(post=post).select_related('user')
        return Response(PostCommentSerializer(comments, many=True).data)

    def post(self, request, post_id):
        try:
            post = CommunityPost.objects.get(id=post_id)
        except CommunityPost.DoesNotExist:
            return Response({'error': 'Post not found.'}, status=404)
        content = request.data.get('content', '').strip()
        if not content:
            return Response({'error': 'Comment cannot be empty.'}, status=400)
        if len(content) > 280:
            return Response({'error': 'Keep it under 280 characters.'}, status=400)
        comment = PostComment.objects.create(user=request.user, post=post, content=content)
        return Response(PostCommentSerializer(comment).data, status=201)


class AssistantChatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'error': 'Message cannot be empty.'}, status=400)
        ChatMessage.objects.create(user=request.user, role='user', content=message)
        recent_history = list(ChatMessage.objects.filter(user=request.user).order_by('-created_at')[:10])
        recent_history.reverse()
        reply_text = get_assistant_reply(request.user, message, recent_history)
        assistant_message = ChatMessage.objects.create(user=request.user, role='assistant', content=reply_text)
        return Response(ChatMessageSerializer(assistant_message).data)


class AssistantHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        messages = ChatMessage.objects.filter(user=request.user)
        return Response(ChatMessageSerializer(messages, many=True).data)


class AssistantClearView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ChatMessage.objects.filter(user=request.user).delete()
        return Response({'status': 'cleared'})


class PredictionsInsightsView(APIView):
    """
    GET /api/predictions/insights/
    A genuinely forward-looking forecast page - every number here answers
    "what will this look like in the future" or shows a real trend over
    time, not just a snapshot of current totals.

    The underlying ML model was trained for a 14-day horizon. The 30/60-day
    figures are an honest LINEAR EXTRAPOLATION of that 14-day model output,
    not independently modeled - documented in methodology_note below.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not hasattr(request.user, 'profile') or request.user.profile.overall_level is None:
            return Response({'error': 'Complete your assessment first to see predictions.'}, status=400)

        user = request.user
        profile = user.profile
        today = timezone.localdate()

        activity = LessonActivity.objects.filter(user=user).aggregate(
            lessons_completed=Count('id'), total_minutes=Sum('time_spent_minutes'), avg_quiz_score=Avg('quiz_score'))
        lessons_completed = activity['lessons_completed'] or 0
        practice_minutes = activity['total_minutes'] or 0
        avg_quiz_score = activity['avg_quiz_score'] or 50

        skills = {'reading': profile.reading_score, 'writing': profile.writing_score, 'comprehension': profile.comprehension_score}
        score_predictions = []
        for skill, current in skills.items():
            if current is None:
                continue
            predicted_14 = predict_future_score(current, lessons_completed, practice_minutes, avg_quiz_score)
            gain_per_day = (predicted_14 - current) / 14
            predicted_30 = min(100, max(0, current + gain_per_day * 30))
            predicted_60 = min(100, max(0, current + gain_per_day * 60))
            milestone = None
            if current <= 40 < predicted_14:
                milestone = "This would move you from Beginner into Intermediate range."
            elif current <= 70 < predicted_14:
                milestone = "This would move you from Intermediate into Advanced range."
            score_predictions.append({
                'skill': skill, 'current_score': round(current, 1),
                'predicted_14d': round(predicted_14, 1), 'predicted_30d': round(predicted_30, 1),
                'predicted_60d': round(predicted_60, 1), 'milestone': milestone,
            })

        historical_trend = {}
        for skill in ['reading', 'writing', 'comprehension']:
            attempts = (AssessmentAttemptLog.objects.filter(user=user, assessment_type=skill)
                        .order_by('attempted_at').values('attempted_at', 'score'))
            historical_trend[skill] = [{'date': a['attempted_at'].strftime('%b %d'), 'score': a['score']} for a in attempts]

        try:
            from curriculum.models import VoicePracticeAttempt, LabRoundResult
        except Exception:
            VoicePracticeAttempt = None
            LabRoundResult = None

        pronunciation_trend = []
        if VoicePracticeAttempt is not None:
            attempts = list(VoicePracticeAttempt.objects.filter(user=user).order_by('attempted_at'))
            pronunciation_trend = [
                {'attempt': i + 1, 'accuracy': round(a.accuracy, 1)} for i, a in enumerate(attempts)
            ][-20:]

        lab_comparison = {}
        if VoicePracticeAttempt is not None:
            voice_agg = VoicePracticeAttempt.objects.filter(user=user).aggregate(avg=Avg('accuracy'), count=Count('id'))
            lab_comparison['voice'] = {'avg_percent': round(voice_agg['avg'], 1) if voice_agg['avg'] else None, 'count': voice_agg['count'] or 0}
        if LabRoundResult is not None:
            for lab_name in ['picture', 'listening']:
                results = LabRoundResult.objects.filter(user=user, lab=lab_name)
                count = results.count()
                if count > 0:
                    total_score = sum(r.score for r in results)
                    total_possible = sum(r.total for r in results)
                    avg_percent = round((total_score / total_possible) * 100, 1) if total_possible else None
                else:
                    avg_percent = None
                lab_comparison[lab_name] = {'avg_percent': avg_percent, 'count': count}

        weekly_lessons = []
        for i in range(5, -1, -1):
            week_end = today - timedelta(days=7 * i)
            week_start = week_end - timedelta(days=6)
            count = LessonActivity.objects.filter(
                user=user, completed_at__date__gte=week_start, completed_at__date__lte=week_end).count()
            weekly_lessons.append({'week': week_start.strftime('%b %d'), 'lessons': count})

        xp_events = []
        for a in LessonActivity.objects.filter(user=user).order_by('completed_at'):
            xp = 20 + round((a.quiz_score or 0) * 0.3)
            xp_events.append((a.completed_at.date(), xp))
        if LabRoundResult is not None:
            for r in LabRoundResult.objects.filter(user=user).order_by('completed_at'):
                ratio = (r.score / r.total) if r.total else 0
                xp = round(5 + ratio * 10)
                xp_events.append((r.completed_at.date(), xp))
        if VoicePracticeAttempt is not None:
            for v in VoicePracticeAttempt.objects.filter(user=user).order_by('attempted_at'):
                xp = round(2 + (v.accuracy / 100) * 6)
                xp_events.append((v.attempted_at.date(), xp))
        xp_events.sort(key=lambda e: e[0])

        xp_by_day = {}
        for day, xp in xp_events:
            xp_by_day[day] = xp_by_day.get(day, 0) + xp
        xp_trajectory = []
        running_total = 0
        for day in sorted(xp_by_day.keys()):
            running_total += xp_by_day[day]
            xp_trajectory.append({'date': day.strftime('%b %d'), 'cumulative_xp': running_total})
        xp_trajectory = xp_trajectory[-20:]

        level_progress = _level_progress_for(user)
        completion_forecast = _estimate_days_to_finish_level(user, level_progress)
        level_up_projected_date = None
        if completion_forecast['estimated_days'] and completion_forecast['estimated_days'] > 0:
            level_up_projected_date = (today + timedelta(days=completion_forecast['estimated_days'])).strftime('%b %d, %Y')

        first_activity = LessonActivity.objects.filter(user=user).aggregate(first=Min('completed_at'))['first']
        if first_activity and lessons_completed > 0:
            days_active = max(1, (timezone.now() - first_activity).days + 1)
            pace_per_day = max(lessons_completed / days_active, 0.05)
        else:
            pace_per_day = None

        predicted_lessons_30d = None
        predicted_xp_30d = None
        if pace_per_day is not None:
            new_lessons_30d = round(pace_per_day * 30)
            predicted_lessons_30d = min(level_progress['total_lessons'], lessons_completed + new_lessons_30d)
            avg_xp_per_lesson = 20 + round((avg_quiz_score or 0) * 0.3)
            predicted_xp_30d = (profile.xp or 0) + new_lessons_30d * avg_xp_per_lesson

        perfect_lessons = LessonActivity.objects.filter(user=user, quiz_score=100).count()
        voice_attempts_count = lab_comparison.get('voice', {}).get('count', 0)

        achievement_thresholds = [
            {'id': 'five_lessons', 'name': 'Getting Started', 'icon': '📚', 'current': lessons_completed, 'target': 5, 'unit': 'lessons'},
            {'id': 'fifteen_lessons', 'name': 'Dedicated Learner', 'icon': '🎓', 'current': lessons_completed, 'target': 15, 'unit': 'lessons'},
            {'id': 'week_streak', 'name': 'Week Warrior', 'icon': '⚡', 'current': profile.longest_streak or 0, 'target': 7, 'unit': 'day streak'},
            {'id': 'voice_practitioner', 'name': 'Voice Practitioner', 'icon': '🎙️', 'current': voice_attempts_count, 'target': 10, 'unit': 'voice attempts'},
            {'id': 'xp_100', 'name': 'Sprout', 'icon': '🌿', 'current': profile.xp or 0, 'target': 100, 'unit': 'XP'},
        ]
        not_yet_earned = [a for a in achievement_thresholds if a['current'] < a['target']]
        next_achievement = None
        if not_yet_earned:
            closest = min(not_yet_earned, key=lambda a: (a['target'] - a['current']) / a['target'])
            remaining = closest['target'] - closest['current']
            eta_days = None
            if closest['id'] in ('five_lessons', 'fifteen_lessons') and pace_per_day:
                eta_days = math.ceil(remaining / pace_per_day)
            next_achievement = {'name': closest['name'], 'icon': closest['icon'], 'remaining': remaining,
                                 'unit': closest['unit'], 'eta_days': eta_days}

        return Response({
            'score_predictions': score_predictions,
            'historical_trend': historical_trend,
            'pronunciation_trend': pronunciation_trend,
            'lab_comparison': lab_comparison,
            'weekly_lessons': weekly_lessons,
            'xp_trajectory': xp_trajectory,
            'completion_forecast': {**completion_forecast, 'level': level_progress['level'], 'projected_date': level_up_projected_date},
            'level_progress': {'completed': level_progress['completed_lessons'], 'total': level_progress['total_lessons'], 'level': level_progress['level']},
            'engagement_forecast': {
                'pace_per_day': round(pace_per_day, 2) if pace_per_day else None,
                'predicted_lessons_30d': predicted_lessons_30d,
                'current_lessons': lessons_completed,
                'predicted_xp_30d': predicted_xp_30d,
                'current_xp': profile.xp or 0,
            },
            'next_achievement': next_achievement,
            'methodology_note': (
                '14-day score forecasts come from a Random Forest model. 30/60-day figures are '
                'a linear extrapolation of that same model output, not independently modeled - '
                'treat them as a rough trendline, not a precise forecast.'
            ),
        })


class ExternalResourcesView(APIView):
    """
    GET /api/community/resources/
    Curated external resources (websites, videos, books, communities)
    matched to the learner's current level. Every entry is a real,
    verified, currently-active resource - managed via Django admin.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        level = request.user.profile.overall_level or 'beginner'
        resources = ExternalResource.objects.filter(level=level)
        return Response(ExternalResourceSerializer(resources, many=True).data)