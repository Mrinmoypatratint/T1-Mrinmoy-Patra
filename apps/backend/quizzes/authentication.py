import requests
from django.conf import settings

_FIREBASE_VERIFY_URL = (
    "https://identitytoolkit.googleapis.com/v1/accounts:lookup"
)


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token using the Firebase REST API.
    Returns the Firebase user-info dict on success.
    Raises ValueError with a descriptive message on failure.
    """
    resp = requests.post(
        _FIREBASE_VERIFY_URL,
        params={"key": settings.FIREBASE_API_KEY},
        json={"idToken": id_token},
        timeout=10,
    )
    data = resp.json()
    if resp.status_code != 200 or "error" in data:
        msg = data.get("error", {}).get("message", "Invalid token")
        raise ValueError(msg)
    users = data.get("users", [])
    if not users:
        raise ValueError("Token verified but user not found")
    return users[0]
