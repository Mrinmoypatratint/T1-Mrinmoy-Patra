import logging

from django.db.models import Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from quizzes.models import User, Quiz, Question
from quizzes.serializers import CreateQuizSerializer
from quizzes.views.helpers import ok, err, validation_err

logger = logging.getLogger(__name__)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def quizzes_root(request):
    if request.method == "GET":
        return _list_quizzes(request)
    return _create_quiz(request)


def _list_quizzes(request):
    quizzes = (
        Quiz.objects.filter(is_published=True)
        .select_related("created_by")
        .annotate(
            question_count=Count("questions"),
            attempt_count=Count("attempts"),
        )
        .order_by("-created_at")
    )

    data = [
        {
            "id": str(q.id),
            "title": q.title,
            "description": q.description,
            "timeLimit": q.time_limit,
            "createdAt": q.created_at.isoformat(),
            "creator": {"id": str(q.created_by.id), "name": q.created_by.name},
            "questionCount": q.question_count,
            "attemptCount": q.attempt_count,
        }
        for q in quizzes
    ]

    return ok(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_quiz(request, quiz_id):
    try:
        quiz = Quiz.objects.select_related("created_by").get(id=quiz_id)
    except Quiz.DoesNotExist:
        return err("Quiz not found", 404)

    questions = quiz.questions.order_by("order").values(
        "id", "question_text", "options", "order"
    )

    return ok(
        {
            "id": str(quiz.id),
            "title": quiz.title,
            "description": quiz.description,
            "timeLimit": quiz.time_limit,
            "createdAt": quiz.created_at.isoformat(),
            "creator": {
                "id": str(quiz.created_by.id),
                "name": quiz.created_by.name,
            },
            "attemptCount": quiz.attempts.count(),
            "questions": [
                {
                    "id": str(q["id"]),
                    "questionText": q["question_text"],
                    "options": q["options"],
                    "order": q["order"],
                }
                for q in questions
            ],
        }
    )


def _create_quiz(request):
    if request.user.role != "ADMIN":
        return err("Admin access required.", 403)

    ser = CreateQuizSerializer(data=request.data)
    if not ser.is_valid():
        return validation_err(ser)

    data = ser.validated_data
    quiz = Quiz.objects.create(
        title=data["title"],
        description=data["description"],
        time_limit=data["timeLimit"],
        is_published=True,
        created_by_id=request.user.user_id,
    )

    questions = []
    for idx, q in enumerate(data["questions"]):
        questions.append(
            Question(
                quiz=quiz,
                question_text=q["questionText"],
                options=q["options"],
                correct_answer_index=q["correctAnswerIndex"],
                order=idx,
            )
        )
    Question.objects.bulk_create(questions)

    qs = quiz.questions.order_by("order")
    return ok(
        {
            "id": str(quiz.id),
            "title": quiz.title,
            "description": quiz.description,
            "timeLimit": quiz.time_limit,
            "createdAt": quiz.created_at.isoformat(),
            "creator": {
                "id": request.user.user_id,
                "name": User.objects.get(id=request.user.user_id).name,
            },
            "questions": [
                {
                    "id": str(q.id),
                    "questionText": q.question_text,
                    "options": q.options,
                    "correctAnswerIndex": q.correct_answer_index,
                    "order": q.order,
                }
                for q in qs
            ],
        },
        message="Quiz created successfully",
        code=201,
    )
