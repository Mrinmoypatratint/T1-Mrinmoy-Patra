from rest_framework.views import exception_handler
from rest_framework.exceptions import Throttled


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        if isinstance(exc, Throttled):
            response.data = {
                "success": False,
                "error": "Too many requests. Please try again later.",
            }
        else:
            detail = response.data.get("detail", str(exc))
            response.data = {
                "success": False,
                "error": str(detail),
            }

    return response
