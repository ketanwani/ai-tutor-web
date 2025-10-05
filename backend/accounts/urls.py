from django.urls import path
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),
    path('profile/', views.get_user_profile, name='user_profile'),
    path('create-child/', views.create_child, name='create_child'),
    path('children/', views.get_children, name='get_children'),
    path('student-login/', views.student_login, name='student_login'),
    path('student-profile/', views.get_student_profile, name='get_student_profile'),
    path('parent-login/', views.parent_login, name='parent_login'),
    path('parent-signup/', views.parent_signup, name='parent_signup'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('request-password-reset/', views.request_password_reset, name='request_password_reset'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('delete-child/<int:child_id>/', views.delete_child, name='delete_child'),
]
