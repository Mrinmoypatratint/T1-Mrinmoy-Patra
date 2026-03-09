from quizzes.views.auth import google_login, signup, login, get_me
from quizzes.views.quiz import quizzes_root, get_quiz
from quizzes.views.attempt import submit_attempt, user_results, attempt_detail
from quizzes.views.health import health

__all__ = [
    "google_login",
    "signup",
    "login",
    "get_me",
    "quizzes_root",
    "get_quiz",
    "submit_attempt",
    "user_results",
    "attempt_detail",
    "health",
]
