from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Department, Issue, Vote, IssueUpdate, Notification


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'user_type', 'ward_number', 'reputation_score', 'is_verified']
    list_filter = ['user_type', 'is_verified']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {'fields': ('user_type', 'phone_number', 'ward_number', 'district', 'reputation_score', 'is_verified', 'profile_picture')}),
    )


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'issue_category', 'head_officer']


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'severity', 'status', 'ward_number', 'priority_score', 'created_at']
    list_filter = ['category', 'severity', 'status', 'ward_number']
    search_fields = ['title', 'description', 'address']
    readonly_fields = ['priority_score', 'created_at', 'updated_at']


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ['voter', 'issue', 'created_at']


@admin.register(IssueUpdate)
class IssueUpdateAdmin(admin.ModelAdmin):
    list_display = ['issue', 'update_type', 'updated_by', 'old_status', 'new_status', 'created_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'channel', 'is_sent', 'created_at']
