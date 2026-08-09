from rest_framework import serializers
from .models import User, LearnerProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'preferred_language', 'age', 'education_level', 'learning_goal']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            preferred_language=validated_data.get('preferred_language', 'en'),
            age=validated_data.get('age'),
            education_level=validated_data.get('education_level', 'none'),
            learning_goal=validated_data.get('learning_goal'),
        )
        LearnerProfile.objects.create(user=user)
        return user


class LearnerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnerProfile
        fields = [
            'reading_score', 'writing_score', 'comprehension_score', 'overall_level',
            'current_streak', 'longest_streak', 'last_activity_date', 'xp', 'created_at', 'updated_at',
        ]


class UserSerializer(serializers.ModelSerializer):
    profile = LearnerProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'preferred_language', 'age', 'education_level', 'learning_goal', 'profile']


class SettingsUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'preferred_language', 'age']


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value