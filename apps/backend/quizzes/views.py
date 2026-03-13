from datetime import datetime, timezone

from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .authentication import verify_firebase_token
from .models import AppUser, Quiz, Question, Attempt


# ─── Auth helper ──────────────────────────────────────────────────────────────

def _get_auth_user(request) -> AppUser:
    """
    Extract the Firebase ID token from the Authorization header,
    validate it against the Firebase REST API, then get-or-create
    the corresponding AppUser row in our database.

    Raises PermissionError if the token is missing or invalid.
    """
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if not auth_header.startswith("Bearer "):
        raise PermissionError("Authorization header missing or malformed")

    token = auth_header[len("Bearer "):]
    try:
        fb_user = verify_firebase_token(token)
    except ValueError as exc:
        raise PermissionError(f"Token validation failed: {exc}") from exc

    uid = fb_user.get("localId")
    email = fb_user.get("email", "")
    name = fb_user.get("displayName") or email.split("@")[0]
    photo_url = fb_user.get("photoUrl", "")

    # Determine role from the ADMIN_EMAILS env var
    admin_emails = [
        e.strip().lower()
        for e in settings.ADMIN_EMAILS.split(",")
        if e.strip()
    ]
    role = "ADMIN" if email.lower() in admin_emails else "USER"

    user, _ = AppUser.objects.update_or_create(
        uid=uid,
        defaults={
            "name": name,
            "email": email,
            "photo_url": photo_url,
            "role": role,
        },
    )
    return user


def _auth_error(exc: PermissionError):
    return Response({"error": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)


# ─── GET /api/me ──────────────────────────────────────────────────────────────

@api_view(["GET"])
def me(request):
    try:
        user = _get_auth_user(request)
    except PermissionError as exc:
        return _auth_error(exc)

    return Response({
        "id": user.uid,
        "email": user.email,
        "name": user.name,
        "photoUrl": user.photo_url,
        "role": user.role,
        "createdAt": user.created_at.isoformat(),
    })


# ─── GET /api/quizzes  POST /api/quizzes ─────────────────────────────────────

@api_view(["GET", "POST"])
def quizzes(request):
    try:
        user = _get_auth_user(request)
    except PermissionError as exc:
        return _auth_error(exc)

    if request.method == "GET":
        qs = (
            Quiz.objects
            .filter(is_published=True)
            .select_related("created_by")
            .order_by("-created_at")
        )
        return Response([
            {
                "id": str(q.id),
                "title": q.title,
                "description": q.description,
                "timeLimit": q.time_limit,
                "createdAt": q.created_at.isoformat(),
                "creator": {"id": q.created_by.uid, "name": q.created_by.name},
                "questionCount": q.questions.count(),
                "attemptCount": q.attempts.count(),
            }
            for q in qs
        ])

    # POST — admin only
    if user.role != "ADMIN":
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN,
        )

    body = request.data
    title = str(body.get("title", "")).strip()
    description = str(body.get("description", "")).strip()
    time_limit = body.get("timeLimit") or body.get("time_limit")
    questions_data = body.get("questions", [])

    if not title or not time_limit or not questions_data:
        return Response(
            {"error": "title, timeLimit, and questions are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        time_limit = int(time_limit)
        if time_limit < 1:
            raise ValueError
    except (TypeError, ValueError):
        return Response(
            {"error": "timeLimit must be a positive integer"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    quiz = Quiz.objects.create(
        title=title,
        description=description,
        time_limit=time_limit,
        created_by=user,
    )

    for idx, q in enumerate(questions_data):
        opts = q.get("options", [])
        cai = q.get("correctAnswerIndex", 0)
        if not isinstance(opts, list) or len(opts) != 4:
            quiz.delete()
            return Response(
                {"error": "Each question must have exactly 4 options"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not isinstance(cai, int) or cai not in range(4):
            quiz.delete()
            return Response(
                {"error": "correctAnswerIndex must be 0–3"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        Question.objects.create(
            quiz=quiz,
            question_text=str(q.get("questionText", "")).strip(),
            options=opts,
            correct_answer_index=cai,
            order=idx,
        )

    return Response(
        {
            "id": str(quiz.id),
            "title": quiz.title,
            "description": quiz.description,
            "timeLimit": quiz.time_limit,
            "createdAt": quiz.created_at.isoformat(),
            "creator": {"id": user.uid, "name": user.name},
            "attemptCount": 0,
            "questions": [
                {
                    "id": str(q.id),
                    "questionText": q.question_text,
                    "options": q.options,
                    "order": q.order,
                }
                for q in quiz.questions.all()
            ],
        },
        status=status.HTTP_201_CREATED,
    )


# ─── GET/PATCH/DELETE /api/quizzes/<id> ──────────────────────────────────────

@api_view(["GET", "PATCH", "DELETE"])
def quiz_detail(request, quiz_id):
    try:
        user = _get_auth_user(request)
    except PermissionError as exc:
        return _auth_error(exc)

    try:
        quiz = (
            Quiz.objects
            .select_related("created_by")
            .prefetch_related("questions")
            .get(id=quiz_id)
        )
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        # Questions are returned WITHOUT correctAnswerIndex — answers stay server-side.
        return Response({
            "id": str(quiz.id),
            "title": quiz.title,
            "description": quiz.description,
            "timeLimit": quiz.time_limit,
            "createdAt": quiz.created_at.isoformat(),
            "creator": {"id": quiz.created_by.uid, "name": quiz.created_by.name},
            "attemptCount": quiz.attempts.count(),
            "questions": [
                {
                    "id": str(q.id),
                    "questionText": q.question_text,
                    "options": q.options,
                    "order": q.order,
                }
                for q in quiz.questions.all().order_by("order")
            ],
        })

    # PATCH / DELETE require admin
    if user.role != "ADMIN":
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN,
        )

    if request.method == "PATCH":
        body = request.data
        quiz.title = str(body.get("title", quiz.title)).strip() or quiz.title
        quiz.description = body.get("description", quiz.description)
        if "timeLimit" in body:
            quiz.time_limit = int(body["timeLimit"])
        if "isPublished" in body:
            quiz.is_published = bool(body["isPublished"])
        quiz.save()
        return Response({
            "id": str(quiz.id),
            "title": quiz.title,
            "isPublished": quiz.is_published,
        })

    # DELETE
    quiz.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── GET /api/quizzes/<id>/my-attempt ────────────────────────────────────────

@api_view(["GET"])
def my_attempt(request, quiz_id):
    try:
        user = _get_auth_user(request)
    except PermissionError as exc:
        return _auth_error(exc)

    try:
        attempt = Attempt.objects.get(quiz__id=quiz_id, user=user)
        return Response({"attemptId": str(attempt.id)})
    except Attempt.DoesNotExist:
        return Response({"attemptId": None})


# ─── POST /api/attempt ───────────────────────────────────────────────────────

@api_view(["POST"])
def submit_attempt(request):
    try:
        user = _get_auth_user(request)
    except PermissionError as exc:
        return _auth_error(exc)

    body = request.data
    quiz_id = body.get("quizId") or body.get("quiz_id")
    answers = body.get("answers", {})
    started_at_str = body.get("startedAt") or body.get("started_at")

    if not quiz_id:
        return Response(
            {"error": "quizId is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        quiz = Quiz.objects.get(id=quiz_id)
    except Quiz.DoesNotExist:
        return Response({"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND)

    if Attempt.objects.filter(quiz=quiz, user=user).exists():
        return Response(
            {"error": "You have already attempted this quiz"},
            status=status.HTTP_409_CONFLICT,
        )

    # Load questions with correct answers — server-side only
    questions = list(quiz.questions.all().order_by("order"))

    # Grade the submission server-side
    score = 0
    review = []
    for q in questions:
        raw = answers.get(str(q.id))
        selected_idx = int(raw) if raw is not None else -1
        is_correct = selected_idx == q.correct_answer_index
        if is_correct:
            score += 1
        review.append({
            "questionId": str(q.id),
            "questionText": q.question_text,
            "options": q.options,
            "correctAnswerIndex": q.correct_answer_index,
            "selectedAnswerIndex": selected_idx,
            "isCorrect": is_correct,
        })

    # Parse startedAt
    if started_at_str:
        try:
            started_at = datetime.fromisoformat(
                started_at_str.replace("Z", "+00:00")
            )
        except ValueError:
            started_at = datetime.now(timezone.utc)
    else:
        started_at = datetime.now(timezone.utc)

    attempt = Attempt.objects.create(
        quiz=quiz,
        user=user,
        answers=answers,
        score=score,
        total_score=len(questions),
        review=review,
        started_at=started_at,
    )

    return Response(
        {
            "id": str(attempt.id),
            "quizId": str(quiz.id),
            "quizTitle": quiz.title,
            "score": attempt.score,
            "totalScore": attempt.total_score,
            "submittedAt": attempt.submitted_at.isoformat(),
        },
        status=status.HTTP_201_CREATED,
    )


# ─── GET /api/results/<user_id> ──────────────────────────────────────────────

@api_view(["GET"])
def results(request, user_id):
    try:
        user = _get_auth_user(request)
    except PermissionError as exc:
        return _auth_error(exc)

    # Users may only see their own history; admins can see anyone's.
    if user.uid != user_id and user.role != "ADMIN":
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

    attempts = (
        Attempt.objects
        .filter(user__uid=user_id)
        .select_related("quiz")
        .order_by("-submitted_at")
    )

    return Response([
        {
            "id": str(a.id),
            "quizId": str(a.quiz.id),
            "quizTitle": a.quiz.title,
            "quizDescription": a.quiz.description,
            "questionCount": a.total_score,
            "score": a.score,
            "totalScore": a.total_score,
            "percentage": round((a.score / a.total_score) * 100) if a.total_score else 0,
            "submittedAt": a.submitted_at.isoformat(),
        }
        for a in attempts
    ])


# ─── GET /api/attempts/<id> ──────────────────────────────────────────────────

@api_view(["GET"])
def attempt_detail(request, attempt_id):
    try:
        user = _get_auth_user(request)
    except PermissionError as exc:
        return _auth_error(exc)

    try:
        attempt = Attempt.objects.select_related("quiz", "user").get(id=attempt_id)
    except Attempt.DoesNotExist:
        return Response({"error": "Attempt not found"}, status=status.HTTP_404_NOT_FOUND)

    if attempt.user.uid != user.uid and user.role != "ADMIN":
        return Response({"error": "Access denied"}, status=status.HTTP_403_FORBIDDEN)

    pct = round((attempt.score / attempt.total_score) * 100) if attempt.total_score else 0
    return Response({
        "id": str(attempt.id),
        "quizId": str(attempt.quiz.id),
        "quizTitle": attempt.quiz.title,
        "score": attempt.score,
        "totalScore": attempt.total_score,
        "percentage": pct,
        "startedAt": attempt.started_at.isoformat(),
        "submittedAt": attempt.submitted_at.isoformat(),
        "review": attempt.review,
    })


# ─── GET /api/admin/quizzes ──────────────────────────────────────────────────

@api_view(["GET"])
def admin_quizzes(request):
    try:
        user = _get_auth_user(request)
    except PermissionError as exc:
        return _auth_error(exc)

    if user.role != "ADMIN":
        return Response(
            {"error": "Admin access required"},
            status=status.HTTP_403_FORBIDDEN,
        )

    qs = Quiz.objects.select_related("created_by").order_by("-created_at")
    return Response([
        {
            "id": str(q.id),
            "title": q.title,
            "description": q.description,
            "timeLimit": q.time_limit,
            "isPublished": q.is_published,
            "createdAt": q.created_at.isoformat(),
            "creator": {"id": q.created_by.uid, "name": q.created_by.name},
            "questionCount": q.questions.count(),
            "attemptCount": q.attempts.count(),
        }
        for q in qs
    ])
