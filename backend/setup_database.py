#!/usr/bin/env python
"""
Database setup script for AI Tutor SG
Run this script to initialize the database with sample data
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ai_tutor_sg.settings')
django.setup()

from django.contrib.auth import get_user_model
from accounts.models import User
from quiz.models import StudentProfile, Topic

def create_sample_data():
    """Create sample data for testing"""
    
    # Create a parent user
    parent, created = User.objects.get_or_create(
        username='parent@example.com',
        defaults={
            'email': 'parent@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'is_parent': True,
            'is_staff': True,
            'is_superuser': True
        }
    )
    if created:
        parent.set_password('password123')
        parent.save()
        print(f"Created parent user: {parent.username}")
    
    # Create sample topics
    topics_data = [
        # Primary 4 Math
        {'name': 'Fractions', 'subject': 'Math', 'level': 'P4'},
        {'name': 'Decimals', 'subject': 'Math', 'level': 'P4'},
        {'name': 'Addition', 'subject': 'Math', 'level': 'P4'},
        {'name': 'Subtraction', 'subject': 'Math', 'level': 'P4'},
        
        # Primary 5 Math
        {'name': 'Fractions', 'subject': 'Math', 'level': 'P5'},
        {'name': 'Decimals', 'subject': 'Math', 'level': 'P5'},
        {'name': 'Multiplication', 'subject': 'Math', 'level': 'P5'},
        {'name': 'Division', 'subject': 'Math', 'level': 'P5'},
        
        # Primary 6 Math
        {'name': 'Fractions', 'subject': 'Math', 'level': 'P6'},
        {'name': 'Decimals', 'subject': 'Math', 'level': 'P6'},
        {'name': 'Algebra', 'subject': 'Math', 'level': 'P6'},
        {'name': 'Geometry', 'subject': 'Math', 'level': 'P6'},
    ]
    
    for topic_data in topics_data:
        topic, created = Topic.objects.get_or_create(**topic_data)
        if created:
            print(f"Created topic: {topic.name} ({topic.subject} - {topic.level})")
    
    # Create sample student profiles
    students_data = [
        {'name': 'Alex', 'level': 'P4'},
        {'name': 'Emma', 'level': 'P5'},
        {'name': 'Ryan', 'level': 'P6'},
    ]
    
    for student_data in students_data:
        student, created = StudentProfile.objects.get_or_create(
            parent=parent,
            name=student_data['name'],
            defaults={'level': student_data['level']}
        )
        if created:
            print(f"Created student: {student.name} ({student.level}) - Join Code: {student.join_code}")
    
    print("\nSample data created successfully!")
    print(f"Parent login: {parent.username} / password123")
    print("Student join codes:")
    for student in StudentProfile.objects.filter(parent=parent):
        print(f"  {student.name}: {student.join_code}")

if __name__ == '__main__':
    create_sample_data()
