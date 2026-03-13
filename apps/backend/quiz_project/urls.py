from django.urls import path, include

from .views import root, health

urlpatterns = [
    path("", root),
    path("api/health", health),
    path("api/", include("quizzes.urls")),
]
