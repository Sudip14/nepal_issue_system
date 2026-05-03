from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator
import math


class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('citizen', 'Citizen'),
        ('authority', 'Authority'),
        ('admin', 'Admin'),
    ]
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='citizen')
    phone_number = models.CharField(max_length=15, blank=True)
    ward_number = models.IntegerField(null=True, blank=True)
    district = models.CharField(max_length=100, default='Kathmandu')
    reputation_score = models.FloatField(default=0.0)
    is_verified = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.username} ({self.user_type})"


class Department(models.Model):
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=50)
    issue_category = models.CharField(max_length=100)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=15)
    head_officer = models.CharField(max_length=200)
    ward_coverage = models.JSONField(default=list)

    class Meta:
        db_table = 'departments'

    def __str__(self):
        return self.name


class Issue(models.Model):
    CATEGORY_CHOICES = [
        ('road', 'Road & Infrastructure'),
        ('water', 'Water Supply'),
        ('power', 'Electricity & Power'),
        ('waste', 'Waste Management'),
        ('sanitation', 'Sanitation'),
        ('drainage', 'Drainage'),
        ('other', 'Other'),
    ]
    SEVERITY_CHOICES = [
        (1, 'Low'),
        (2, 'Medium'),
        (3, 'High'),
        (4, 'Critical'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('assigned', 'Assigned'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
    ]

    reporter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='reported_issues')
    assigned_department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')

    title = models.CharField(max_length=300)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    severity = models.IntegerField(choices=SEVERITY_CHOICES, default=1)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='pending')

    # Location
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.TextField()
    ward_number = models.IntegerField()
    district = models.CharField(max_length=100, default='Kathmandu')
    affected_radius_meters = models.IntegerField(default=100)

    # Impact
    affected_people_count = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    # Smart priority score
    priority_score = models.FloatField(default=0.0)

    # Context flags
    is_rainy_season_issue = models.BooleanField(default=False)
    is_night_safety_issue = models.BooleanField(default=False)
    is_tourist_area = models.BooleanField(default=False)

    # Media & AI
    image = models.ImageField(upload_to='issues/', null=True, blank=True)
    ai_detected_category = models.CharField(max_length=100, blank=True)

    # Spam
    is_spam = models.BooleanField(default=False)
    spam_score = models.FloatField(default=0.0)

    # Offline
    offline_id = models.CharField(max_length=100, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'issues'
        ordering = ['-priority_score', '-created_at']

    def __str__(self):
        return f"[{self.category}] {self.title}"

    def calculate_priority_score(self):
        from django.utils import timezone
        vote_count = self.votes.count()
        severity_weight = self.severity * 10
        age_days = (timezone.now() - self.created_at).days
        age_factor = math.log1p(age_days) * 2
        location_importance = 1.5 if self.is_tourist_area else 1.0
        self.priority_score = (
            (vote_count * 1.5) +
            severity_weight +
            age_factor +
            (self.affected_people_count * 0.5)
        ) * location_importance
        self.save(update_fields=['priority_score'])
        return self.priority_score


class Vote(models.Model):
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='votes')
    voter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='votes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'votes'
        unique_together = ('issue', 'voter')

    def __str__(self):
        return f"{self.voter.username} voted on Issue #{self.issue.id}"


class IssueUpdate(models.Model):
    UPDATE_TYPE_CHOICES = [
        ('status_change', 'Status Change'),
        ('comment', 'Comment'),
        ('assignment', 'Assignment'),
        ('inspection', 'Inspection'),
        ('resolution', 'Resolution'),
    ]

    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='updates')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    update_type = models.CharField(max_length=30, choices=UPDATE_TYPE_CHOICES)
    message = models.TextField()
    old_status = models.CharField(max_length=30, blank=True)
    new_status = models.CharField(max_length=30, blank=True)
    contractor_name = models.CharField(max_length=200, blank=True)
    estimated_completion_days = models.IntegerField(null=True, blank=True)
    inspection_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'issue_updates'
        ordering = ['created_at']


class Notification(models.Model):
    CHANNEL_CHOICES = [
        ('sms', 'SMS'),
        ('email', 'Email'),
        ('app', 'App Push'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, null=True, blank=True)
    channel = models.CharField(max_length=10, choices=CHANNEL_CHOICES)
    message = models.TextField()
    is_sent = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)    # ← ADD THIS LINE
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'