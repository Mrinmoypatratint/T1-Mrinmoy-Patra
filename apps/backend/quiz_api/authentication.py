import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from quiz_api.models import User


class AuthenticatedUser:
    """Lightweight user object attached to request.user"""

    def __init__(self, user_id, email, role):
        self.user_id = str(user_id)
        self.pk = str(user_id)
        self.email = email
        self.role = role
        self.is_authenticated = True


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return None

        token = auth_header.split(" ", 1)[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid or expired token.")

        return (
            AuthenticatedUser(
                user_id=payload["userId"],
                email=payload["email"],
                role=payload["role"],
            ),
            token,
        )
