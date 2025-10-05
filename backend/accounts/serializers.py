from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_parent', 'date_joined']
        read_only_fields = ['id', 'date_joined']


class StudentLoginSerializer(serializers.Serializer):
    join_code = serializers.CharField(max_length=6)

    def validate_join_code(self, value):
        from quiz.models import StudentProfile
        try:
            student = StudentProfile.objects.get(join_code=value)
            return value
        except StudentProfile.DoesNotExist:
            raise serializers.ValidationError("Invalid join code")
