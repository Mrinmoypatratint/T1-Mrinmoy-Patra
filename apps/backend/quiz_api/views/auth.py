import bcrypt
import logging

from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle

from quiz_api.models import User
from quiz_api.serializers import (
    GoogleLoginSerializer,
    SignupSerializer,
    LoginSerializer,
)
from quiz_api.views.helpers import sign_jwt, user_to_dict, ok, err, validation_err

logger = logging.getLogger(__name__)


class AuthRateThrottle(AnonRateThrottle):
    rate = "20/hour"


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def google_login(request):
    ser = GoogleLoginSerializer(data=request.data)
    if not ser.is_valid():
        return validation_err(ser)

    credential = ser.validated_data["credential"]

    try:
        idinfo = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError:
        return err("Invalid Google credential", 401)

    email = idinfo.get("email")
    if not email:
        return err("Invalid Google token payload", 401)

    name = idinfo.get("name") or email.split("@")[0]
    picture = idinfo.get("picture")
    is_admin = email.lower() in settings.ADMIN_EMAILS

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "name": name,
            "photo_url": picture,
            "role": User.Role.ADMIN if is_admin else User.Role.USER,
        },
    )

    if created:
        logger.info("New user created: %s role=%s", user.email, user.role)
    elif is_admin and user.role != User.Role.ADMIN:
        user.role = User.Role.ADMIN
        user.save(update_fields=["role"])
        logger.info("User promoted to admin: %s", user.email)

    token = sign_jwt(user.id, user.email, user.role)
    return ok({"token": token, "user": user_to_dict(user)})


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def signup(request):
    ser = SignupSerializer(data=request.data)
    if not ser.is_valid():
        return validation_err(ser)

    email = ser.validated_data["email"].lower()
    name = ser.validated_data["name"]
    password = ser.validated_data["password"]

    if User.objects.filter(email=email).exists():
        return err("An account with this email already exists", 409)

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(12)).decode()
    is_admin = email in settings.ADMIN_EMAILS

    user = User.objects.create(
        email=email,
        name=name,
        password=hashed,
        role=User.Role.ADMIN if is_admin else User.Role.USER,
    )
    logger.info("New user registered: %s", user.email)

    token = sign_jwt(user.id, user.email, user.role)
    return ok(
        {"token": token, "user": user_to_dict(user)},
        message="Account created successfully",
        code=201,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login(request):
    ser = LoginSerializer(data=request.data)
    if not ser.is_valid():
        return validation_err(ser)

    email = ser.validated_data["email"].lower()
    password = ser.validated_data["password"]

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return err("Invalid email or password", 401)

    if not user.password:
        return err("Invalid email or password", 401)

    if not bcrypt.checkpw(password.encode(), user.password.encode()):
        return err("Invalid email or password", 401)

    # Promote to admin if applicable
    is_admin = email in settings.ADMIN_EMAILS
    if is_admin and user.role != User.Role.ADMIN:
        user.role = User.Role.ADMIN
        user.save(update_fields=["role"])

    logger.info("User logged in: %s", user.email)
    token = sign_jwt(user.id, user.email, user.role)
    return ok({"token": token, "user": user_to_dict(user)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_me(request):
    try:
        user = User.objects.get(id=request.user.user_id)
    except User.DoesNotExist:
        return err("User not found", 404)

    return ok(user_to_dict(user))
