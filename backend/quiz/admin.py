from django.contrib import admin
from .models import Topic, Question, StudentProfile, QuizSession


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("name", "subject", "level", "is_active")
    list_filter = ("subject", "level", "is_active")
    search_fields = ("name",)


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "subject", "level", "topic", "difficulty", "source", "flag_count")
    list_filter = ("subject", "level", "difficulty", "source")
    search_fields = ("question_text", "source_id")


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("name", "level", "parent", "xp", "streak")
    list_filter = ("level",)
    search_fields = ("name", "join_code", "parent__email")


@admin.register(QuizSession)
class QuizSessionAdmin(admin.ModelAdmin):
    list_display = ("student", "subject", "topic", "is_correct", "created_at")
    list_filter = ("subject", "topic", "is_correct")
    search_fields = ("student__name", "topic")

from django.contrib import admin

# Register your models here.
