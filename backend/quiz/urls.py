from django.urls import path
from . import views

urlpatterns = [
    path('generate-question/', views.generate_question, name='generate_question'),
    path('submit-answer/', views.submit_answer, name='submit_answer'),
    path('topics/', views.get_topics, name='get_topics'),
    path('progress/<int:student_id>/', views.get_progress, name='get_progress'),
    path('start-session/', views.start_quiz_session, name='start_quiz_session'),
    # Question bank
    path('questions/', views.list_questions, name='list_questions'),
    path('questions/random/', views.random_question, name='random_question'),
    path('questions/<int:question_id>/flag/', views.flag_question, name='flag_question'),
]
