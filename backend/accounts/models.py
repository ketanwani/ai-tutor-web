from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    is_parent = models.BooleanField(default=False)
    google_id = models.CharField(max_length=100, null=True, blank=True)
    email_verification_token = models.CharField(max_length=100, null=True, blank=True)
    password_reset_token = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({'Parent' if self.is_parent else 'Student'})"