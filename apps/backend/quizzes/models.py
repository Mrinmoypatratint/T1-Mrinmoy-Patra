from django.db import models


class AppUser(models.Model):
    uid = models.CharField(max_length=128, primary_key=True)  # Firebase UID
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    photo_url = models.TextField(blank=True, default="")
    role = models.CharField(max_length=10, default="USER")  # USER | ADMIN
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.name} <{self.email}>"


class Quiz(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    time_limit = models.PositiveIntegerField()  # minutes
    is_published = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        AppUser, on_delete=models.CASCADE, related_name="quizzes"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "quizzes"

    def __str__(self):
        return self.title


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_text = models.TextField()
    options = models.JSONField()                  # list of 4 strings
    correct_answer_index = models.PositiveSmallIntegerField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "questions"
        ordering = ["order"]

    def __str__(self):
        return f"Q{self.order + 1}: {self.question_text[:60]}"


class Attempt(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name="attempts")
    answers = models.JSONField()          # {"<question_id>": selected_index}
    score = models.PositiveIntegerField()
    total_score = models.PositiveIntegerField()
    review = models.JSONField(default=list)
    started_at = models.DateTimeField()
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "attempts"
        unique_together = [("quiz", "user")]  # one attempt per user per quiz

    def __str__(self):
        return f"{self.user} → {self.quiz} ({self.score}/{self.total_score})"
