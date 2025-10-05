from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from .models import StudentProfile, QuizSession, Topic, Question
from .serializers import (
    QuizSessionSerializer, SubmitAnswerSerializer, TopicSerializer,
    QuestionResponseSerializer, ProgressSerializer, QuestionSerializer
)
import json
import random
# Question bank endpoints
@api_view(['GET'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def list_questions(request):
    subject = request.GET.get('subject')
    level = request.GET.get('level')
    topic_id = request.GET.get('topic')

    qs = Question.objects.all()
    if subject:
        qs = qs.filter(subject=subject)
    if level:
        qs = qs.filter(level=level)
    if topic_id:
        qs = qs.filter(topic_id=topic_id)

    serializer = QuestionSerializer(qs[:200], many=True)
    return Response(serializer.data)


@api_view(['GET'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def random_question(request):
    subject = request.GET.get('subject')
    level = request.GET.get('level')
    topic_id = request.GET.get('topic')

    qs = Question.objects.all()
    if subject:
        qs = qs.filter(subject=subject)
    if level:
        qs = qs.filter(level=level)
    if topic_id:
        qs = qs.filter(topic_id=topic_id)

    count = qs.count()
    if count == 0:
        return Response({'error': 'No questions found'}, status=status.HTTP_404_NOT_FOUND)
    question = qs.order_by('?').first()
    return Response(QuestionSerializer(question).data)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([permissions.AllowAny])
def flag_question(request, question_id):
    try:
        q = Question.objects.get(id=question_id)
        q.flag_count = (q.flag_count or 0) + 1
        q.save(update_fields=['flag_count'])
        return Response({'message': 'Question flagged'})
    except Question.DoesNotExist:
        return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)


# Mock question data for MVP
MOCK_QUESTIONS = {
    'Math': {
        'P3': {
            'Addition': [
                {
                    'question_text': 'What is 15 + 27?',
                    'options': ['32', '42', '52', '62'],
                    'correct_answer': '42',
                    'explanation': 'Add the ones: 5 + 7 = 12. Write 2, carry 1. Add the tens: 1 + 2 + 1 = 4. Answer: 42.'
                },
                {
                    'question_text': 'Sarah has 8 apples. She buys 12 more. How many apples does she have now?',
                    'options': ['18', '20', '22', '24'],
                    'correct_answer': '20',
                    'explanation': '8 + 12 = 20. Sarah has 20 apples in total.'
                }
            ],
            'Subtraction': [
                {
                    'question_text': 'What is 45 - 18?',
                    'options': ['27', '37', '47', '57'],
                    'correct_answer': '27',
                    'explanation': 'Subtract: 45 - 18 = 27. You can check by adding: 27 + 18 = 45.'
                }
            ]
        },
        'P4': {
            'Fractions': [
                {
                    'question_text': 'What is 3/4 + 2/3?',
                    'options': ['5/7', '17/12', '13/12', '9/7'],
                    'correct_answer': '17/12',
                    'explanation': 'Find a common denominator (12): 3/4=9/12, 2/3=8/12, total=17/12.'
                },
                {
                    'question_text': 'Which fraction is larger: 2/3 or 3/4?',
                    'options': ['2/3', '3/4', 'They are equal', 'Cannot compare'],
                    'correct_answer': '3/4',
                    'explanation': 'Convert to common denominator: 2/3=8/12, 3/4=9/12. Since 9>8, 3/4 is larger.'
                }
            ],
            'Decimals': [
                {
                    'question_text': 'What is 0.5 + 0.3?',
                    'options': ['0.8', '0.15', '0.53', '0.35'],
                    'correct_answer': '0.8',
                    'explanation': 'Add decimals: 0.5 + 0.3 = 0.8'
                }
            ]
        },
        'P5': {
            'Fractions': [
                {
                    'question_text': 'What is 2/3 × 3/4?',
                    'options': ['6/12', '5/7', '6/7', '1/2'],
                    'correct_answer': '6/12',
                    'explanation': 'Multiply numerators: 2×3=6. Multiply denominators: 3×4=12. Simplify: 6/12 = 1/2.'
                }
            ]
        },
        'P6': {
            'Fractions': [
                {
                    'question_text': 'What is 5/6 ÷ 2/3?',
                    'options': ['10/18', '15/12', '5/4', '3/4'],
                    'correct_answer': '5/4',
                    'explanation': 'To divide fractions, multiply by the reciprocal: 5/6 × 3/2 = 15/12 = 5/4.'
                }
            ]
        }
    }
}


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def generate_question(request):
    """Generate a question for the specified topic"""
    topic = request.GET.get('topic', '')
    level = request.GET.get('level', '')
    subject = request.GET.get('subject', 'Math')
    
    if not topic or not level:
        return Response(
            {'error': 'Topic and level are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get questions from mock data
    questions = MOCK_QUESTIONS.get(subject, {}).get(level, {}).get(topic, [])
    
    if not questions:
        return Response(
            {'error': f'No questions available for {subject} {level} {topic}'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Select a random question
    question = random.choice(questions)
    
    response_data = {
        'subject': subject,
        'level': level,
        'topic': topic,
        'question_text': question['question_text'],
        'options': question['options'],
        'correct_answer': question['correct_answer'],
        'explanation': question['explanation']
    }
    
    return Response(response_data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def submit_answer(request):
    """Submit and store student's answer"""
    serializer = SubmitAnswerSerializer(data=request.data)
    if serializer.is_valid():
        session_id = serializer.validated_data['session_id']
        user_answer = serializer.validated_data['user_answer']
        
        try:
            session = QuizSession.objects.get(id=session_id)
            session.user_answer = user_answer
            session.is_correct = (user_answer == session.correct_answer)
            session.save()
            
            # Update student XP and streak
            student = session.student
            if session.is_correct:
                student.xp += 10
                student.streak += 1
            else:
                student.streak = 0
            student.save()
            
            return Response({
                'is_correct': session.is_correct,
                'correct_answer': session.correct_answer,
                'explanation': session.explanation,
                'xp_gained': 10 if session.is_correct else 0
            })
        except QuizSession.DoesNotExist:
            return Response(
                {'error': 'Session not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_topics(request):
    """Get available topics for a level and subject"""
    level = request.GET.get('level', '')
    subject = request.GET.get('subject', 'Math')
    
    if not level:
        return Response(
            {'error': 'Level is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # For MVP, return topics from mock data
    topics = list(MOCK_QUESTIONS.get(subject, {}).get(level, {}).keys())
    
    return Response({'topics': topics})


@api_view(['GET'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def get_progress(request, student_id):
    """Get progress analytics for a student"""
    from accounts.models import User
    
    try:
        student = StudentProfile.objects.get(id=student_id)
        
        # Get user data from frontend
        user_data = request.META.get('HTTP_X_USER_DATA')
        parent_user = None
        
        if user_data:
            import json
            try:
                user_info = json.loads(user_data)
                # Try to find parent user
                parent_user = User.objects.filter(
                    email=user_info.get('email', 'demo@example.com')
                ).first()
                print(f"Found parent user for progress: {parent_user.email if parent_user else 'None'}")
            except Exception as e:
                print(f"Error parsing user data in progress: {e}")
        
        # If no parent user found, try default
        if not parent_user:
            parent_user = User.objects.filter(email='demo@example.com').first()
            print(f"Using default parent user for progress: {parent_user.email if parent_user else 'None'}")
        
        # Check if user has permission to view this student's progress
        if not parent_user or student.parent != parent_user:
            print(f"Permission denied: parent_user={parent_user}, student.parent={student.parent}")
            return Response(
                {'error': 'Permission denied'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get quiz sessions for this student
        sessions = QuizSession.objects.filter(student=student)
        
        # Calculate progress by topic
        progress_data = []
        topics = sessions.values('topic').distinct()
        
        for topic_data in topics:
            topic = topic_data['topic']
            topic_sessions = sessions.filter(topic=topic)
            total_questions = topic_sessions.count()
            correct_answers = topic_sessions.filter(is_correct=True).count()
            accuracy = (correct_answers / total_questions * 100) if total_questions > 0 else 0
            last_attempt = topic_sessions.order_by('-created_at').first().created_at if topic_sessions.exists() else None
            
            progress_data.append({
                'topic': topic,
                'total_questions': total_questions,
                'correct_answers': correct_answers,
                'accuracy': round(accuracy, 2),
                'last_attempt': last_attempt
            })
        
        return Response({
            'student': {
                'id': student.id,
                'name': student.name,
                'level': student.level,
                'xp': student.xp,
                'streak': student.streak
            },
            'progress': progress_data
        })
        
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def start_quiz_session(request):
    """Start a new quiz session and return a question"""
    topic = request.data.get('topic', '')
    level = request.data.get('level', '')
    subject = request.data.get('subject', 'Math')
    
    if not topic or not level:
        return Response(
            {'error': 'Topic and level are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get student profile (assuming user is logged in as parent, get first child for now)
    # In a real app, you'd pass student_id or get it from session
    try:
        student = StudentProfile.objects.filter(parent=request.user).first()
        if not student:
            return Response(
                {'error': 'No student profile found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    except:
        return Response(
            {'error': 'Student profile required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate question
    questions = MOCK_QUESTIONS.get(subject, {}).get(level, {}).get(topic, [])
    if not questions:
        return Response(
            {'error': f'No questions available for {subject} {level} {topic}'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    question = random.choice(questions)
    
    # Create quiz session
    session = QuizSession.objects.create(
        student=student,
        subject=subject,
        topic=topic,
        question_text=question['question_text'],
        correct_answer=question['correct_answer'],
        explanation=question['explanation']
    )
    
    return Response({
        'session_id': session.id,
        'question_text': question['question_text'],
        'options': question['options']
    })