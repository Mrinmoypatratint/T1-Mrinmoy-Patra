import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField


class User(models.Model):
    class Role(models.TextChoices):
        USER = "USER"
        ADMIN = "ADMIN"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=255, null=True, blank=True)
    photo_url = models.URLField(null=True, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["email"], name="idx_users_email"),
        ]

    def __str__(self):
        return self.email


class Quiz(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    time_limit = models.IntegerField()  # seconds
    is_published = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="quizzes", db_column="created_by"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "quizzes"
        indexes = [
            models.Index(fields=["-created_at"], name="idx_quizzes_created"),
            models.Index(fields=["is_published"], name="idx_quizzes_published"),
        ]

    def __str__(self):
        return self.title


class Question(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="questions", db_column="quiz_id"
    )
    question_text = models.TextField()
    options = ArrayField(models.CharField(max_length=500))
    correct_answer_index = models.IntegerField()
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "questions"
        ordering = ["order"]

    def __str__(self):
        return self.question_text[:50]


class Attempt(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="attempts", db_column="quiz_id"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="attempts", db_column="user_id"
    )
    answers = models.JSONField()  # {questionId: selectedIndex}
    score = models.IntegerField()
    total_score = models.IntegerField()
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "attempts"
        constraints = [
            models.UniqueConstraint(fields=["quiz", "user"], name="unique_quiz_user"),
        ]
        indexes = [
            models.Index(fields=["user", "-submitted_at"], name="idx_attempts_user_date"),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.quiz.title}"

