from rest_framework import serializers
from .models import StudentProfile, QuizSession, Topic, Question
from accounts.models import User


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['id', 'name', 'level', 'join_code', 'xp', 'streak', 'created_at']
        read_only_fields = ['id', 'join_code', 'xp', 'streak', 'created_at']


class CreateStudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = ['name', 'level']

    def create(self, validated_data):
        parent = self.context['request'].user
        validated_data['parent'] = parent
        return super().create(validated_data)


class QuizSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizSession
        fields = ['id', 'student', 'subject', 'topic', 'question_text', 'user_answer', 
                 'correct_answer', 'explanation', 'is_correct', 'created_at']
        read_only_fields = ['id', 'created_at']


class SubmitAnswerSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    user_answer = serializers.CharField(max_length=500)

    def validate_session_id(self, value):
        try:
            session = QuizSession.objects.get(id=value)
            return value
        except QuizSession.DoesNotExist:
            raise serializers.ValidationError("Invalid session ID")


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'subject', 'level', 'is_active']


class QuestionResponseSerializer(serializers.Serializer):
    subject = serializers.CharField()
    level = serializers.CharField()
    topic = serializers.CharField()
    question_text = serializers.CharField()
    options = serializers.ListField(child=serializers.CharField())
    correct_answer = serializers.CharField()
    explanation = serializers.CharField()


class ProgressSerializer(serializers.Serializer):
    topic = serializers.CharField()
    total_questions = serializers.IntegerField()
    correct_answers = serializers.IntegerField()
    accuracy = serializers.FloatField()
    last_attempt = serializers.DateTimeField()


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'id', 'subject', 'level', 'topic', 'question_text',
            'is_multiple_choice', 'options', 'correct_answer', 'explanation',
            'difficulty', 'source', 'source_id', 'license'
        ]
