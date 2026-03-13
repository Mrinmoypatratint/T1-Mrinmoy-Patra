from django.urls import path

from . import views

urlpatterns = [
    path("me", views.me),
    path("quizzes", views.quizzes),
    path("quizzes/<int:quiz_id>", views.quiz_detail),
    path("quizzes/<int:quiz_id>/my-attempt", views.my_attempt),
    path("attempt", views.submit_attempt),
    path("results/<str:user_id>", views.results),
    path("attempts/<int:attempt_id>", views.attempt_detail),
    path("admin/quizzes", views.admin_quizzes),
]
