from django.urls import path

from .views import root, health

urlpatterns = [
    path("", root),
    path("api/health", health),
]
