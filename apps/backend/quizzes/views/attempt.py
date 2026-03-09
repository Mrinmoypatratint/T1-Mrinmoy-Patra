import logging
from datetime import datetime, timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from quizzes.models import Quiz, Attempt
from quizzes.serializers import SubmitAttemptSerializer
from quizzes.views.helpers import ok, err, validation_err

logger = logging.getLogger(__name__)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_attempt(request):
    ser = SubmitAttemptSerializer(data=request.data)
    if not ser.is_valid():
        return validation_err(ser)

    data = ser.validated_data
    user_id = request.user.user_id
    quiz_id = str(data["quizId"])

    try:
        quiz = Quiz.objects.prefetch_related("questions").get(id=quiz_id)
    except Quiz.DoesNotExist:
        return err("Quiz not found", 404)

    if Attempt.objects.filter(quiz_id=quiz_id, user_id=user_id).exists():
        return err("You have already attempted this quiz", 409)

    started_at = data["startedAt"]
    now = datetime.now(timezone.utc)
    elapsed = (now - started_at).total_seconds()
    if elapsed > quiz.time_limit + 5:
        logger.warning(
            "Late submission: user=%s quiz=%s elapsed=%.1f limit=%d",
            user_id,
            quiz_id,
            elapsed,
            quiz.time_limit,
        )

    answers = data["answers"]
    score = 0
    questions = quiz.questions.all()
    total_score = questions.count()

    for question in questions:
        q_id = str(question.id)
        if q_id in answers and answers[q_id] == question.correct_answer_index:
            score += 1

    attempt = Attempt.objects.create(
        quiz_id=quiz_id,
        user_id=user_id,
        answers=answers,
        score=score,
        total_score=total_score,
        started_at=started_at,
    )

    return ok(
        {
            "id": str(attempt.id),
            "quizId": str(attempt.quiz_id),
            "quizTitle": quiz.title,
            "score": attempt.score,
            "totalScore": attempt.total_score,
            "submittedAt": attempt.submitted_at.isoformat(),
        },
        message="Quiz submitted successfully",
        code=201,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_results(request, user_id):
    if user_id != request.user.user_id:
        return err("You can only view your own results", 403)

    attempts = (
        Attempt.objects.filter(user_id=user_id)
        .select_related("quiz")
        .order_by("-submitted_at")
    )

    data = []
    for a in attempts:
        pct = round((a.score / a.total_score) * 100) if a.total_score else 0
        data.append(
            {
                "id": str(a.id),
                "quizId": str(a.quiz_id),
                "quizTitle": a.quiz.title,
                "quizDescription": a.quiz.description,
                "questionCount": a.quiz.questions.count(),
                "score": a.score,
                "totalScore": a.total_score,
                "percentage": pct,
                "submittedAt": a.submitted_at.isoformat(),
            }
        )

    return ok(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attempt_detail(request, attempt_id):
    try:
        attempt = (
            Attempt.objects.select_related("quiz")
            .prefetch_related("quiz__questions")
            .get(id=attempt_id)
        )
    except Attempt.DoesNotExist:
        return err("Attempt not found", 404)

    if str(attempt.user_id) != request.user.user_id:
        return err("You can only view your own attempts", 403)

    answers = attempt.answers or {}
    review = []
    for q in attempt.quiz.questions.order_by("order"):
        q_id = str(q.id)
        selected = answers.get(q_id, -1)
        review.append(
            {
                "questionId": q_id,
                "questionText": q.question_text,
                "options": q.options,
                "correctAnswerIndex": q.correct_answer_index,
                "selectedAnswerIndex": selected,
                "isCorrect": selected == q.correct_answer_index,
            }
        )

    pct = round((attempt.score / attempt.total_score) * 100) if attempt.total_score else 0

    return ok(
        {
            "id": str(attempt.id),
            "quizId": str(attempt.quiz_id),
            "quizTitle": attempt.quiz.title,
            "score": attempt.score,
            "totalScore": attempt.total_score,
            "percentage": pct,
            "startedAt": attempt.started_at.isoformat(),
            "submittedAt": attempt.submitted_at.isoformat(),
            "review": review,
        }
    )
