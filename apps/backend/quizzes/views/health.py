from datetime import datetime, timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from quizzes.views.helpers import ok


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return ok({"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()})
