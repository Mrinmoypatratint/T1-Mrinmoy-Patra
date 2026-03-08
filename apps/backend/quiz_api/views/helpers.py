import jwt
import logging
from datetime import datetime, timedelta, timezone

from django.conf import settings
from rest_framework.response import Response

logger = logging.getLogger(__name__)


def sign_jwt(user_id: str, email: str, role: str) -> str:
    payload = {
        "userId": str(user_id),
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def user_to_dict(user) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "photoUrl": user.photo_url,
        "role": user.role,
        "createdAt": user.created_at.isoformat() if user.created_at else None,
    }


def ok(data, message=None, code=200):
    body = {"success": True, "data": data}
    if message:
        body["message"] = message
    return Response(body, status=code)


def err(message, code=400):
    return Response({"success": False, "error": message}, status=code)


def validation_err(serializer):
    errors = []
    for field, msgs in serializer.errors.items():
        for msg in msgs:
            errors.append({"field": field, "message": str(msg)})
    return Response(
        {"success": False, "error": "Validation failed", "details": errors},
        status=400,
    )
