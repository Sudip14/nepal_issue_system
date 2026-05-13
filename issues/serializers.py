from rest_framework import serializers
from .models import User, Department, Issue, Vote, IssueUpdate, Notification, Comment, IssueImage


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


# 🆕 ISSUE IMAGE SERIALIZER
class IssueImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = IssueImage
        fields = ['id', 'issue', 'image', 'image_url', 'caption', 'uploaded_at', 'order']
        read_only_fields = ['id', 'uploaded_at']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if request and obj.image:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url if obj.image else None


class IssueListSerializer(serializers.ModelSerializer):
    vote_count = serializers.SerializerMethodField()
    has_voted = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    image_count = serializers.SerializerMethodField()  # 🆕
    reporter_name = serializers.CharField(source='reporter.username', read_only=True)
    department_name = serializers.CharField(source='assigned_department.name', read_only=True)

    class Meta:
        model = Issue
        fields = ['id', 'title', 'category', 'severity', 'status',
                  'ward_number', 'address', 'affected_people_count',
                  'priority_score', 'vote_count', 'has_voted', 'comment_count',
                  'image_count',  # 🆕
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

    def get_comment_count(self, obj):
        return obj.comments.filter(is_deleted=False).count()

    def get_image_count(self, obj):  # 🆕
        return obj.images.count()


class IssueDetailSerializer(IssueListSerializer):
    updates = IssueUpdateSerializer(many=True, read_only=True)
    reporter = UserSerializer(read_only=True)
    assigned_department = DepartmentSerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    images = IssueImageSerializer(many=True, read_only=True)  # 🆕 Gallery
    gallery = serializers.SerializerMethodField()  # 🆕 Full gallery URLs

    class Meta(IssueListSerializer.Meta):
        fields = '__all__'

    def get_comments(self, obj):
        top_comments = obj.comments.filter(parent=None, is_deleted=False).order_by('-created_at')
        return CommentSerializer(top_comments, many=True).data

    def get_gallery(self, obj):  # 🆕
        request = self.context.get('request')
        images = obj.images.all().order_by('order')
        return IssueImageSerializer(images, many=True, context={'request': request}).data


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


class CommentSerializer(serializers.ModelSerializer):
    time_ago = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    reply_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'issue', 'parent', 'user_name', 'user_role',
            'content', 'created_at', 'updated_at', 'time_ago', 
            'reply_count', 'replies'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_time_ago(self, obj):
        from django.utils.timesince import timesince
        return timesince(obj.created_at) + ' ago'

    def get_replies(self, obj):
        replies = obj.replies.filter(is_deleted=False).order_by('created_at')
        if replies.exists():
            return CommentSerializer(replies, many=True).data
        return []


class CommentCreateSerializer(serializers.ModelSerializer):
    parent_id = serializers.IntegerField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = Comment
        fields = ['content', 'parent_id']

    def validate_content(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Comment content is required.")
        if len(value) > 2000:
            raise serializers.ValidationError("Comment must be under 2000 characters.")
        return value.strip()