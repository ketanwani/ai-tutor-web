from rest_framework import status, permissions
import logging
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from .models import User as CustomUser
from .serializers import UserSerializer, StudentLoginSerializer

logger = logging.getLogger(__name__)
from quiz.models import StudentProfile
from quiz.serializers import StudentProfileSerializer
import json


@api_view(['GET'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'ok', 'message': 'Backend is running'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_user_profile(request):
    """Get current user profile"""
    # For development, we'll return the user data from the frontend
    # The frontend sends user data in the request headers or body
    user_data = request.META.get('HTTP_X_USER_DATA')
    if user_data:
        import json
        try:
            user_info = json.loads(user_data)
            return Response(user_info)
        except:
            pass
    
    # Fallback to mock data if no user data provided
    mock_user = {
        'id': 1,
        'username': 'parent@example.com',
        'email': 'parent@example.com',
        'first_name': 'John',
        'last_name': 'Doe',
        'is_parent': True,
        'date_joined': '2024-01-01T00:00:00Z'
    }
    return Response(mock_user)


@api_view(['POST'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def create_child(request):
    """Create a new child profile for parent"""
    from quiz.serializers import CreateStudentSerializer
    from accounts.models import User
    from quiz.models import StudentProfile
    
    try:
        # Get user data from frontend
        user_data = request.META.get('HTTP_X_USER_DATA')
        parent_user = None
        
        if user_data:
            import json
            try:
                user_info = json.loads(user_data)
                # Try to find or create parent user
                parent_user, created = User.objects.get_or_create(
                    email=user_info.get('email', 'demo@example.com'),
                    defaults={
                        'first_name': user_info.get('first_name', 'Demo'),
                        'last_name': user_info.get('last_name', 'User'),
                        'is_parent': True
                    }
                )
                print(f"Parent user: {parent_user.email}, created: {created}")
            except Exception as e:
                print(f"Error parsing user data: {e}")
        
        # If no parent user found, create a default one
        if not parent_user:
            parent_user, created = User.objects.get_or_create(
                email='demo@example.com',
                defaults={
                    'first_name': 'Demo',
                    'last_name': 'User',
                    'is_parent': True
                }
            )
            print(f"Created default parent user: {parent_user.email}")
        
        # Create the actual child profile in database
        import random
        import string
        
        # Generate a unique join code
        while True:
            join_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not StudentProfile.objects.filter(join_code=join_code).exists():
                break
        
        child_profile = StudentProfile.objects.create(
            parent=parent_user,
            name=request.data.get('name'),
            level=request.data.get('level'),
            join_code=join_code
        )
        
        print(f"Created child profile: {child_profile.name} with join code: {child_profile.join_code}")
        
        # Return the created child data
        child_data = {
            'id': child_profile.id,
            'name': child_profile.name,
            'level': child_profile.level,
            'join_code': child_profile.join_code,
            'xp': 0,
            'streak': 0,
            'created_at': child_profile.created_at.isoformat()
        }
        
        return Response(child_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        print(f"Error creating child: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def get_children(request):
    """Get all children for current parent"""
    from accounts.models import User
    from quiz.models import StudentProfile
    
    try:
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
                print(f"Found parent user: {parent_user.email if parent_user else 'None'}")
            except Exception as e:
                print(f"Error parsing user data: {e}")
        
        # If no parent user found, try default
        if not parent_user:
            parent_user = User.objects.filter(email='demo@example.com').first()
            print(f"Using default parent user: {parent_user.email if parent_user else 'None'}")
        
        # Get children for this parent
        if parent_user:
            children = StudentProfile.objects.filter(parent=parent_user)
            children_data = []
            for child in children:
                children_data.append({
                    'id': child.id,
                    'name': child.name,
                    'level': child.level,
                    'join_code': child.join_code,
                    'xp': child.xp,  # Get actual XP from database
                    'streak': child.streak,  # Get actual streak from database
                    'created_at': child.created_at.isoformat()
                })
            
            print(f"Found {len(children_data)} children for parent {parent_user.email}")
            return Response(children_data)
        else:
            print("No parent user found, returning empty list")
            return Response([])
            
    except Exception as e:
        print(f"Error in get_children: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def student_login(request):
    """Student login with join code"""
    from quiz.models import StudentProfile
    
    try:
        join_code = request.data.get('join_code', '').upper()
        print(f"Student login attempt with join code: {join_code}")
        
        if not join_code:
            return Response(
                {'error': 'Join code is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find student by join code
        student = StudentProfile.objects.get(join_code=join_code)
        print(f"Found student: {student.name} for parent: {student.parent.email}")
        
        # Create or get token for the student's parent account
        from rest_framework.authtoken.models import Token as AuthToken
        token, created = AuthToken.objects.get_or_create(user=student.parent)
        
        # Return student and parent data
        student_data = {
            'id': student.id,
            'name': student.name,
            'level': student.level,
            'join_code': student.join_code,
            'xp': student.xp,
            'streak': student.streak
        }
        
        parent_data = {
            'id': student.parent.id,
            'email': student.parent.email,
            'first_name': student.parent.first_name,
            'last_name': student.parent.last_name,
            'is_parent': student.parent.is_parent
        }
        
        return Response({
            'token': token.key,
            'student': student_data,
            'parent': parent_data
        })
        
    except StudentProfile.DoesNotExist:
        print(f"Student not found with join code: {join_code}")
        return Response(
            {'error': 'Invalid join code'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(f"Error in student login: {e}")
        return Response(
            {'error': 'Login failed'}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def parent_login(request):
    """Parent login with email and password"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        logger.info("[LOGIN] Parent login attempt for email=%s", email)
        # Authenticate user
        user = authenticate(username=email, password=password)
        logger.info("[LOGIN] authenticate(username=email) -> %s", 'success' if user else 'None')
        
        if user is None:
            # Try to find user by email
            try:
                user_obj = CustomUser.objects.get(email=email)
                logger.info("[LOGIN] Found user by email. username=%s is_active=%s is_parent=%s", user_obj.username, user_obj.is_active, user_obj.is_parent)
                user = authenticate(username=user_obj.username, password=password)
                logger.info("[LOGIN] authenticate(username=user.username) -> %s", 'success' if user else 'None')
            except CustomUser.DoesNotExist:
                logger.warning("[LOGIN] No user exists with email=%s", email)
                pass
        
        if user:
            logger.info("[LOGIN] Authenticated user id=%s is_active=%s is_parent=%s", user.id, user.is_active, user.is_parent)
        
        if user and user.is_parent and user.is_active:
            # Create or get token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'username': user.username,
                    'is_parent': user.is_parent
                }
            })
        else:
            error_msg = 'Invalid credentials or not a parent account'
            if user and not user.is_active:
                error_msg = 'Account not verified. Please check your email to verify your account.'
            elif user and not user.is_parent:
                error_msg = 'This account is not a parent account.'
            logger.warning("[LOGIN] Failed login for email=%s: %s", email, error_msg)
            return Response(
                {'error': error_msg},
                status=status.HTTP_401_UNAUTHORIZED
            )
            
    except Exception as e:
        print(f"Error in parent login: {e}")
        return Response(
            {'error': 'Login failed'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_student_profile(request):
    """Get student profile by join code (for students)"""
    join_code = request.GET.get('join_code')
    if not join_code:
        return Response(
            {'error': 'Join code required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        student = StudentProfile.objects.get(join_code=join_code)
        return Response(StudentProfileSerializer(student).data)
    except StudentProfile.DoesNotExist:
        return Response(
            {'error': 'Student not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['DELETE'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def delete_child(request, child_id):
    """Delete a child profile"""
    from accounts.models import User
    from quiz.models import StudentProfile
    
    try:
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
                print(f"Found parent user for deletion: {parent_user.email if parent_user else 'None'}")
            except Exception as e:
                print(f"Error parsing user data in delete: {e}")
        
        # If no parent user found, try default
        if not parent_user:
            parent_user = User.objects.filter(email='demo@example.com').first()
            print(f"Using default parent user for deletion: {parent_user.email if parent_user else 'None'}")
        
        # Find the child and verify it belongs to the parent
        if parent_user:
            try:
                child = StudentProfile.objects.get(id=child_id, parent=parent_user)
                child_name = child.name
                child.delete()
                print(f"Deleted child: {child_name} (ID: {child_id})")
                return Response({
                    'message': f'Child "{child_name}" has been deleted successfully',
                    'deleted_child_id': child_id
                })
            except StudentProfile.DoesNotExist:
                print(f"Child {child_id} not found for parent {parent_user.email}")
                return Response(
                    {'error': 'Child not found or does not belong to you'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        else:
            print("No parent user found for deletion")
            return Response(
                {'error': 'Parent not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
    except Exception as e:
        print(f"Error deleting child: {e}")
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def parent_signup(request):
    """Parent registration with email verification"""
    from django.contrib.auth import get_user_model
    from django.core.mail import send_mail
    from django.conf import settings
    import uuid
    
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Check if user already exists
        if CustomUser.objects.filter(email=email).exists():
            return Response(
                {'error': 'User with this email already exists'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user account (inactive until email verification)
        # Ensure username is set since the default User model requires it
        user = CustomUser.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_parent=True,
            is_active=False  # Inactive until email verification
        )
        
        # Generate email verification token
        verification_token = str(uuid.uuid4())
        user.email_verification_token = verification_token
        user.save()
        
        # Send verification email
        verification_url = f"http://localhost:3000/verify-email?token={verification_token}"
        
        logger.info("[EMAIL] Sending verification email to %s via %s as %s", email, settings.EMAIL_BACKEND, settings.DEFAULT_FROM_EMAIL)
        logger.debug("[EMAIL] SMTP host=%s port=%s use_tls=%s user=%s", getattr(settings, 'EMAIL_HOST', ''), getattr(settings, 'EMAIL_PORT', ''), getattr(settings, 'EMAIL_USE_TLS', ''), getattr(settings, 'EMAIL_HOST_USER', ''))
        send_mail(
            'Verify Your Email - AI Tutor SG',
            f'''
            Welcome to AI Tutor SG!
            
            Please verify your email address by clicking the link below:
            {verification_url}
            
            If you didn't create this account, please ignore this email.
            
            Best regards,
            AI Tutor SG Team
            ''',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        logger.info("[EMAIL] Verification email queued successfully for %s", email)
        return Response({
            'message': 'Registration successful! Please check your email to verify your account.',
            'email': email,
            'verification_sent': True
        })
        
    except Exception as e:
        print(f"Error in parent signup: {e}")
        return Response(
            {'error': 'Registration failed. Please try again.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def verify_email(request):
    """Verify email address with token"""
    token = request.data.get('token')
    
    if not token:
        return Response(
            {'error': 'Verification token is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = CustomUser.objects.get(email_verification_token=token)
        user.is_active = True
        user.email_verification_token = None
        user.save()
        
        return Response({
            'message': 'Email verified successfully! You can now login.',
            'email': user.email
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired verification token'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(f"Error in email verification: {e}")
        return Response(
            {'error': 'Email verification failed'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def request_password_reset(request):
    """Request password reset email"""
    from django.core.mail import send_mail
    from django.conf import settings
    import uuid
    
    email = request.data.get('email')
    
    if not email:
        return Response(
            {'error': 'Email is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = CustomUser.objects.get(email=email)
        
        # Generate password reset token
        reset_token = str(uuid.uuid4())
        user.password_reset_token = reset_token
        user.save()
        
        # Send password reset email
        reset_url = f"http://localhost:3000/reset-password?token={reset_token}"
        
        logger.info("[EMAIL] Sending password reset email to %s via %s as %s", email, settings.EMAIL_BACKEND, settings.DEFAULT_FROM_EMAIL)
        logger.debug("[EMAIL] SMTP host=%s port=%s use_tls=%s user=%s", getattr(settings, 'EMAIL_HOST', ''), getattr(settings, 'EMAIL_PORT', ''), getattr(settings, 'EMAIL_USE_TLS', ''), getattr(settings, 'EMAIL_HOST_USER', ''))
        send_mail(
            'Reset Your Password - AI Tutor SG',
            f'''
            You requested a password reset for your AI Tutor SG account.
            
            Click the link below to reset your password:
            {reset_url}
            
            If you didn't request this, please ignore this email.
            
            Best regards,
            AI Tutor SG Team
            ''',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        logger.info("[EMAIL] Password reset email queued successfully for %s", email)
        return Response({
            'message': 'Password reset email sent! Please check your email.',
            'email': email
        })
        
    except CustomUser.DoesNotExist:
        # Don't reveal if email exists or not for security
        return Response({
            'message': 'If an account with this email exists, a password reset email has been sent.',
            'email': email
        })
    except Exception as e:
        print(f"Error in password reset request: {e}")
        return Response(
            {'error': 'Password reset request failed'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@authentication_classes([])  # Disable authentication
@permission_classes([permissions.AllowAny])
def reset_password(request):
    """Reset password with token"""
    token = request.data.get('token')
    new_password = request.data.get('new_password')
    
    if not token or not new_password:
        return Response(
            {'error': 'Token and new password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user = CustomUser.objects.get(password_reset_token=token)
        user.set_password(new_password)
        user.password_reset_token = None
        # If account was not verified yet, verify it now to allow immediate login
        was_inactive = not user.is_active
        if was_inactive:
            user.is_active = True
            user.email_verification_token = None
            logger.info("[PASSWORD_RESET] Auto-verified account during reset for email=%s", user.email)
        user.save()
        
        return Response({
            'message': 'Password reset successfully!' + (" Your account has also been verified." if was_inactive else "")
        })
        
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired reset token'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        print(f"Error in password reset: {e}")
        return Response(
            {'error': 'Password reset failed'},
            status=status.HTTP_400_BAD_REQUEST
        )