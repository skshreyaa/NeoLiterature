from django.db.models import Avg, Count, Max
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import (
    Level, Category, Lesson, LessonContent, LessonExercise,
    VoicePracticeItem, VoicePracticeAttempt, LabRoundResult, PictureLabItem,
)
from .serializers import (
    LevelSerializer, CategorySerializer, LessonSerializer, LessonContentSerializer,
    VoicePracticeItemSerializer, VoicePracticeAttemptSerializer, LabRoundResultSerializer,
)

LEVEL_ORDER = ['beginner', 'intermediate', 'advanced']


class LevelViewSet(viewsets.ModelViewSet):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs


class LessonContentViewSet(viewsets.ModelViewSet):
    queryset = LessonContent.objects.all()
    serializer_class = LessonContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        lesson_id = self.request.query_params.get('lesson')
        language = self.request.query_params.get('language')
        if lesson_id:
            qs = qs.filter(lesson_id=lesson_id)
        if language:
            qs = qs.filter(language=language)
        return qs


class CheckExerciseAnswerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        exercise_id = request.data.get('exercise_id')
        answer = request.data.get('answer', '')
        try:
            exercise = LessonExercise.objects.get(id=exercise_id)
        except LessonExercise.DoesNotExist:
            return Response({'error': 'Exercise not found.'}, status=404)
        is_correct = answer.strip().lower() == exercise.correct_answer.strip().lower()
        return Response({'correct': is_correct, 'correct_answer': exercise.correct_answer})


# ============================== VOICE LAB ==============================

class VoiceLabItemsView(APIView):
    """GET /api/curriculum/voice-lab/items/ - practice phrases for the
    learner's current level and language."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        level = request.user.profile.overall_level or 'beginner'
        language = request.query_params.get('language') or request.user.preferred_language

        items = VoicePracticeItem.objects.filter(level=level, language=language)
        if not items.exists():
            items = VoicePracticeItem.objects.filter(level=level, language='en')

        return Response(VoicePracticeItemSerializer(items, many=True).data)


class VoiceLabSubmitView(APIView):
    """POST /api/curriculum/voice-lab/submit/  body: {item_id, transcript}
    Scores pronunciation by word-overlap, logs the attempt, and awards XP
    scaled by accuracy - so repeated practice genuinely earns something."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        item_id = request.data.get('item_id')
        transcript = request.data.get('transcript', '')
        try:
            item = VoicePracticeItem.objects.get(id=item_id)
        except VoicePracticeItem.DoesNotExist:
            return Response({'error': 'Practice item not found.'}, status=404)

        target_words = set(item.text.lower().split())
        said_words = set(transcript.lower().split())
        overlap_ratio = len(target_words & said_words) / len(target_words) if target_words else 0
        accuracy = round(overlap_ratio * 100, 1)

        VoicePracticeAttempt.objects.create(
            user=request.user, item=item, transcript=transcript, accuracy=accuracy,
        )

        from users.streaks import register_activity
        from users.xp import award_voice_xp
        register_activity(request.user.profile)
        xp_earned = award_voice_xp(request.user.profile, accuracy)

        return Response({'accuracy': accuracy, 'xp_earned': xp_earned})


class VoiceLabStatsView(APIView):
    """GET /api/curriculum/voice-lab/stats/ - total attempts, average
    accuracy, and personal best single-attempt accuracy."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        attempts = VoicePracticeAttempt.objects.filter(user=request.user)
        totals = attempts.aggregate(total=Count('id'), avg_accuracy=Avg('accuracy'), best_accuracy=Max('accuracy'))
        recent = attempts[:10]
        return Response({
            'total_attempts': totals['total'] or 0,
            'average_accuracy': round(totals['avg_accuracy'], 1) if totals['avg_accuracy'] else None,
            'best_accuracy': totals['best_accuracy'],
            'recent_attempts': VoicePracticeAttemptSerializer(recent, many=True).data,
        })


# ============================= PICTURE LAB =============================

class PictureLabView(APIView):
    """
    GET /api/curriculum/picture-lab/
    Uses PictureLabItem - real photos and object illustrations, NOT the
    letter/color-word/number flashcards from lesson exercises. Pool is
    cumulative across levels up to the learner's current level, same as
    before, just backed by genuine picture content now.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        import random
        level = request.user.profile.overall_level or 'beginner'
        language = request.query_params.get('language') or request.user.preferred_language

        level_index = LEVEL_ORDER.index(level) if level in LEVEL_ORDER else 0
        eligible_levels = LEVEL_ORDER[:level_index + 1]

        pool = list(PictureLabItem.objects.filter(level__in=eligible_levels, language=language))
        if not pool:
            pool = list(PictureLabItem.objects.filter(level__in=eligible_levels, language='en'))

        if len(pool) < 3:
            return Response([])

        random.shuffle(pool)
        rounds = []
        for picture_item in pool[:12]:
            distractors = [p.correct_answer for p in pool if p.id != picture_item.id]
            random.shuffle(distractors)
            options = [picture_item.correct_answer] + distractors[:2]
            random.shuffle(options)
            rounds.append({'id': picture_item.id, 'image_url': picture_item.image_url, 'options': options})
        return Response(rounds)


class PictureLabCheckView(APIView):
    """POST /api/curriculum/picture-lab/check/  body: {item_id, answer}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        item_id = request.data.get('item_id')
        answer = request.data.get('answer', '')
        try:
            picture_item = PictureLabItem.objects.get(id=item_id)
        except PictureLabItem.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=404)

        is_correct = answer.strip().lower() == picture_item.correct_answer.strip().lower()
        return Response({'correct': is_correct, 'correct_answer': picture_item.correct_answer})


class PictureLabCompleteView(APIView):
    """POST /api/curriculum/picture-lab/complete/  body: {score, total, best_combo}
    Logs the round, awards XP, and reports whether this beat the learner's
    personal best."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        score = int(request.data.get('score', 0))
        total = int(request.data.get('total', 0))
        best_combo = int(request.data.get('best_combo', 0))

        previous_best = (
            LabRoundResult.objects.filter(user=request.user, lab='picture')
            .order_by('-score')
            .first()
        )
        previous_best_percent = round((previous_best.score / previous_best.total) * 100) if previous_best and previous_best.total else 0
        this_percent = round((score / total) * 100) if total else 0
        is_new_best = this_percent > previous_best_percent

        LabRoundResult.objects.create(user=request.user, lab='picture', score=score, total=total, best_combo=best_combo)

        from users.streaks import register_activity
        from users.xp import award_lab_xp
        register_activity(request.user.profile)
        xp_earned = award_lab_xp(request.user.profile, score, total)

        return Response({'xp_earned': xp_earned, 'is_new_best': is_new_best, 'previous_best_percent': previous_best_percent})


class PictureLabStatsView(APIView):
    """GET /api/curriculum/picture-lab/stats/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        results = LabRoundResult.objects.filter(user=request.user, lab='picture')
        total_rounds = results.count()
        best_result = results.order_by('-score').first()
        best_percent = round((best_result.score / best_result.total) * 100) if best_result and best_result.total else None
        best_combo = results.aggregate(best=Max('best_combo'))['best'] or 0
        return Response({
            'total_rounds': total_rounds,
            'best_score_percent': best_percent,
            'best_combo': best_combo,
        })


# ============================ LISTENING LAB =============================

class ListeningLabItemsView(APIView):
    """
    GET /api/curriculum/listening-lab/items/
    Reuses VoicePracticeItem phrases (now with far more content per level).
    The browser speaks the phrase aloud; the learner picks the matching
    text. correct_answer is never sent - checked server-side via
    ListeningLabCheckView.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        import random
        level = request.user.profile.overall_level or 'beginner'
        language = request.query_params.get('language') or request.user.preferred_language

        pool = list(VoicePracticeItem.objects.filter(level=level, language=language))
        if not pool:
            pool = list(VoicePracticeItem.objects.filter(level=level, language='en'))

        if len(pool) < 3:
            return Response([])

        random.shuffle(pool)
        rounds = []
        for item in pool[:12]:
            distractors = [p.text for p in pool if p.id != item.id]
            random.shuffle(distractors)
            options = [item.text] + distractors[:2]
            random.shuffle(options)
            rounds.append({'id': item.id, 'options': options, 'speak_text': item.text})
        return Response(rounds)


class ListeningLabCheckView(APIView):
    """POST /api/curriculum/listening-lab/check/  body: {item_id, answer}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        item_id = request.data.get('item_id')
        answer = request.data.get('answer', '')
        try:
            item = VoicePracticeItem.objects.get(id=item_id)
        except VoicePracticeItem.DoesNotExist:
            return Response({'error': 'Item not found.'}, status=404)

        is_correct = answer.strip().lower() == item.text.strip().lower()
        return Response({'correct': is_correct, 'correct_answer': item.text})


class ListeningLabCompleteView(APIView):
    """POST /api/curriculum/listening-lab/complete/  body: {score, total, best_combo}"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        score = int(request.data.get('score', 0))
        total = int(request.data.get('total', 0))
        best_combo = int(request.data.get('best_combo', 0))

        previous_best = (
            LabRoundResult.objects.filter(user=request.user, lab='listening')
            .order_by('-score')
            .first()
        )
        previous_best_percent = round((previous_best.score / previous_best.total) * 100) if previous_best and previous_best.total else 0
        this_percent = round((score / total) * 100) if total else 0
        is_new_best = this_percent > previous_best_percent

        LabRoundResult.objects.create(user=request.user, lab='listening', score=score, total=total, best_combo=best_combo)

        from users.streaks import register_activity
        from users.xp import award_lab_xp
        register_activity(request.user.profile)
        xp_earned = award_lab_xp(request.user.profile, score, total)

        return Response({'xp_earned': xp_earned, 'is_new_best': is_new_best, 'previous_best_percent': previous_best_percent})


class ListeningLabStatsView(APIView):
    """GET /api/curriculum/listening-lab/stats/"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        results = LabRoundResult.objects.filter(user=request.user, lab='listening')
        total_rounds = results.count()
        best_result = results.order_by('-score').first()
        best_percent = round((best_result.score / best_result.total) * 100) if best_result and best_result.total else None
        best_combo = results.aggregate(best=Max('best_combo'))['best'] or 0
        return Response({
            'total_rounds': total_rounds,
            'best_score_percent': best_percent,
            'best_combo': best_combo,
        })