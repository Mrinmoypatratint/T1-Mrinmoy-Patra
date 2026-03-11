from datetime import datetime, timezone

from django.http import JsonResponse


def root(request):
    return JsonResponse(
        {
            "name": "Quiz Backend",
            "status": "ok",
            "message": "Minimal Django backend is running.",
            "health": "/api/health",
        }
    )


def health(request):
    return JsonResponse(
        {
            "status": "ok",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )
