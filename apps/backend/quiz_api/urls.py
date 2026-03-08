from django.urls import path
from quiz_api import views

urlpatterns = [
    # Health
    path("api/health", views.health),

    # Auth
    path("api/auth/google", views.google_login),
    path("api/auth/signup", views.signup),
    path("api/auth/login", views.login),
    path("api/auth/me", views.get_me),

    # Quizzes
    path("api/quizzes", views.quizzes_root),
    path("api/quizzes/<str:quiz_id>", views.get_quiz),

    # Attempts
    path("api/attempt", views.submit_attempt),
    path("api/attempt/results/<str:user_id>", views.user_results),
    path("api/attempt/detail/<str:attempt_id>", views.attempt_detail),
]
