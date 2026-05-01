from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RegisterView, MeView,
    IssueViewSet, DepartmentViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'issues', IssueViewSet, basename='issue')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/auth/register/', RegisterView.as_view(), name='register'),
    path('api/auth/me/', MeView.as_view(), name='me'),
]