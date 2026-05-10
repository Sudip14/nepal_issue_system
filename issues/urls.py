from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExportExcelView, ExportPDFView
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
    path('api/export/excel/', ExportExcelView.as_view(), name='export-excel'),
    path('api/export/pdf/', ExportPDFView.as_view(), name='export-pdf'),
]