from quiz_api.views.auth import google_login, signup, login, get_me
from quiz_api.views.quiz import quizzes_root, get_quiz
from quiz_api.views.attempt import submit_attempt, user_results, attempt_detail
from quiz_api.views.health import health

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
