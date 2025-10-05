from django.db import models
from accounts.models import User
import random
import string


class StudentProfile(models.Model):
    LEVEL_CHOICES = [
        ('P3', 'Primary 3'),
        ('P4', 'Primary 4'),
        ('P5', 'Primary 5'),
        ('P6', 'Primary 6'),
        ('Sec1', 'Secondary 1'),
        ('Sec2', 'Secondary 2'),
        ('Sec3', 'Secondary 3'),
        ('Sec4', 'Secondary 4'),
    ]

    parent = models.ForeignKey(User, on_delete=models.CASCADE, related_name='children')
    name = models.CharField(max_length=100)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    join_code = models.CharField(max_length=6, unique=True)
    xp = models.IntegerField(default=0)
    streak = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.join_code:
            self.join_code = self.generate_join_code()
        super().save(*args, **kwargs)

    def generate_join_code(self):
        """Generate a unique 6-character join code"""
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not StudentProfile.objects.filter(join_code=code).exists():
                return code

    def __str__(self):
        return f"{self.name} ({self.level})"

    class Meta:
        verbose_name = "Student Profile"
        verbose_name_plural = "Student Profiles"


class QuizSession(models.Model):
    SUBJECT_CHOICES = [
        ('Math', 'Mathematics'),
        ('Science', 'Science'),
        ('English', 'English'),
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='quiz_sessions')
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    topic = models.CharField(max_length=100)
    question_text = models.TextField()
    user_answer = models.CharField(max_length=500, null=True, blank=True)
    correct_answer = models.CharField(max_length=500)
    explanation = models.TextField()
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} - {self.subject} - {self.topic}"

    class Meta:
        verbose_name = "Quiz Session"
        verbose_name_plural = "Quiz Sessions"


class Topic(models.Model):
    """Topics available for each level and subject"""
    LEVEL_CHOICES = [
        ('P3', 'Primary 3'),
        ('P4', 'Primary 4'),
        ('P5', 'Primary 5'),
        ('P6', 'Primary 6'),
        ('Sec1', 'Secondary 1'),
        ('Sec2', 'Secondary 2'),
        ('Sec3', 'Secondary 3'),
        ('Sec4', 'Secondary 4'),
    ]

    SUBJECT_CHOICES = [
        ('Math', 'Mathematics'),
        ('Science', 'Science'),
        ('English', 'English'),
    ]

    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.subject} - {self.level})"

    class Meta:
        verbose_name = "Topic"
        verbose_name_plural = "Topics"
        unique_together = ['name', 'subject', 'level']


class Question(models.Model):
    SUBJECT_CHOICES = [
        ('Math', 'Mathematics'),
        ('Science', 'Science'),
        ('English', 'English'),
    ]

    LEVEL_CHOICES = [
        ('P3', 'Primary 3'), ('P4', 'Primary 4'), ('P5', 'Primary 5'), ('P6', 'Primary 6'),
        ('Sec1', 'Secondary 1'), ('Sec2', 'Secondary 2'), ('Sec3', 'Secondary 3'), ('Sec4', 'Secondary 4'),
    ]

    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES)
    topic = models.ForeignKey(Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name='questions')
    question_text = models.TextField()
    is_multiple_choice = models.BooleanField(default=True)
    options = models.JSONField(default=list, blank=True)
    correct_answer = models.CharField(max_length=500)
    explanation = models.TextField(blank=True)
    difficulty = models.CharField(max_length=20, default='medium')  # easy|medium|hard
    source = models.CharField(max_length=100, blank=True)
    source_id = models.CharField(max_length=100, blank=True)
    license = models.CharField(max_length=100, blank=True)
    flag_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['subject', 'level']),
        ]

    def __str__(self):
        return f"{self.subject}/{self.level} - {self.topic or 'No Topic'}"