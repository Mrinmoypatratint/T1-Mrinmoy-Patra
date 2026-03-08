from rest_framework import serializers


# ─── Auth ───────────────────────────────────────────────
class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField(min_length=1)


class SignupSerializer(serializers.Serializer):
    name = serializers.CharField(min_length=1, max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=1)


# ─── Quiz ───────────────────────────────────────────────
class CreateQuestionSerializer(serializers.Serializer):
    questionText = serializers.CharField(min_length=1)
    options = serializers.ListField(
        child=serializers.CharField(min_length=1),
        min_length=4,
        max_length=4,
    )
    correctAnswerIndex = serializers.IntegerField(min_value=0, max_value=3)


class CreateQuizSerializer(serializers.Serializer):
    title = serializers.CharField(min_length=1, max_length=200)
    description = serializers.CharField(min_length=1, max_length=2000)
    timeLimit = serializers.IntegerField(min_value=30, max_value=7200)
    questions = CreateQuestionSerializer(many=True, min_length=1)


# ─── Attempt ───────────────────────────────────────────
class SubmitAttemptSerializer(serializers.Serializer):
    quizId = serializers.UUIDField()
    answers = serializers.DictField(
        child=serializers.IntegerField(min_value=0, max_value=3)
    )
    startedAt = serializers.DateTimeField()
