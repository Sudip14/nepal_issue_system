from rest_framework import serializers
from .models import User, Department, Issue, Vote, IssueUpdate, Notification


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'user_type',
                  'phone_number', 'ward_number', 'district']

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'user_type', 'phone_number',
                  'ward_number', 'district', 'reputation_score', 'is_verified',
                  'profile_picture', 'date_joined']
        read_only_fields = ['reputation_score', 'is_verified']


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class IssueUpdateSerializer(serializers.ModelSerializer):
    updated_by = UserSerializer(read_only=True)

    class Meta:
        model = IssueUpdate
        fields = '__all__'


class IssueListSerializer(serializers.ModelSerializer):
    vote_count = serializers.SerializerMethodField()
    has_voted = serializers.SerializerMethodField()
    reporter_name = serializers.CharField(source='reporter.username', read_only=True)
    department_name = serializers.CharField(source='assigned_department.name', read_only=True)

    class Meta:
        model = Issue
        fields = ['id', 'title', 'category', 'severity', 'status',
                  'ward_number', 'address', 'affected_people_count',
                  'priority_score', 'vote_count', 'has_voted',
                  'reporter_name', 'department_name', 'image',
                  'is_tourist_area', 'is_rainy_season_issue', 'is_night_safety_issue',
                  'created_at', 'resolved_at']

    def get_vote_count(self, obj):
        return obj.votes.count()

    def get_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.votes.filter(voter=request.user).exists()
        return False


class IssueDetailSerializer(IssueListSerializer):
    updates = IssueUpdateSerializer(many=True, read_only=True)
    reporter = UserSerializer(read_only=True)
    assigned_department = DepartmentSerializer(read_only=True)

    class Meta(IssueListSerializer.Meta):
        fields = '__all__'


class IssueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields = ['title', 'description', 'category', 'severity',
                  'latitude', 'longitude', 'address', 'ward_number',
                  'district', 'affected_people_count', 'affected_radius_meters',
                  'is_rainy_season_issue', 'is_night_safety_issue', 'is_tourist_area',
                  'image', 'offline_id']


class VoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote
        fields = ['id', 'issue', 'voter', 'created_at']
        read_only_fields = ['voter']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
