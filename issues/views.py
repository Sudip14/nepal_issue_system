from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q
from django.utils import timezone
from .models import User, Department, Issue, Vote, IssueUpdate, Notification
from .serializers import (
    RegisterSerializer, UserSerializer, DepartmentSerializer,
    IssueListSerializer, IssueDetailSerializer, IssueCreateSerializer,
    IssueUpdateSerializer, NotificationSerializer
)


class IsAuthorityOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_type in ['authority', 'admin']


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ── Issues ────────────────────────────────────────────────────────────────────

class IssueViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Issue.objects.filter(is_spam=False).select_related(
            'reporter', 'assigned_department'
        ).prefetch_related('votes', 'updates')

        # Filters from query params
        category = self.request.query_params.get('category')
        status_f = self.request.query_params.get('status')
        severity = self.request.query_params.get('severity')
        ward = self.request.query_params.get('ward')
        search = self.request.query_params.get('search')

        if category:
            qs = qs.filter(category=category)
        if status_f:
            qs = qs.filter(status=status_f)
        if severity:
            qs = qs.filter(severity=severity)
        if ward:
            qs = qs.filter(ward_number=ward)
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))

        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return IssueCreateSerializer
        if self.action == 'retrieve':
            return IssueDetailSerializer
        return IssueListSerializer

    def perform_create(self, serializer):
        issue = serializer.save(reporter=self.request.user)
        self._auto_assign_department(issue)
        issue.calculate_priority_score()

    def _auto_assign_department(self, issue):
        category_map = {
            'road': 'Roads',
            'water': 'Water Supply',
            'power': 'Electricity & Power',
            'waste': 'Waste Management',
            'sanitation': 'Waste Management',
            'drainage': 'Water Supply',
        }
        dept_category = category_map.get(issue.category)
        if dept_category:
            dept = Department.objects.filter(issue_category=dept_category).first()
            if dept:
                issue.assigned_department = dept
                issue.status = 'assigned'
                issue.save(update_fields=['assigned_department', 'status'])

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        issue = self.get_object()
        vote, created = Vote.objects.get_or_create(issue=issue, voter=request.user)
        if not created:
            vote.delete()
            issue.calculate_priority_score()
            return Response({'voted': False, 'vote_count': issue.votes.count()})
        issue.calculate_priority_score()
        return Response({'voted': True, 'vote_count': issue.votes.count()}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthorityOrAdmin])
    def update_status(self, request, pk=None):
        issue = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Issue.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        old_status = issue.status
        issue.status = new_status
        if new_status == 'resolved':
            issue.resolved_at = timezone.now()
        issue.save()
        IssueUpdate.objects.create(
            issue=issue,
            updated_by=request.user,
            update_type='status_change',
            message=request.data.get('message', f'Status updated to {new_status}'),
            old_status=old_status,
            new_status=new_status,
            contractor_name=request.data.get('contractor_name', ''),
            estimated_completion_days=request.data.get('estimated_completion_days'),
            inspection_date=request.data.get('inspection_date'),
        )
        return Response(IssueDetailSerializer(issue, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = Issue.objects.filter(is_spam=False)
        return Response({
            'total': qs.count(),
            'pending': qs.filter(status='pending').count(),
            'under_review': qs.filter(status='under_review').count(),
            'assigned': qs.filter(status='assigned').count(),
            'in_progress': qs.filter(status='in_progress').count(),
            'resolved': qs.filter(status='resolved').count(),
            'by_category': list(qs.values('category').annotate(count=Count('id'))),
            'by_severity': list(qs.values('severity').annotate(count=Count('id'))),
        })

    @action(detail=False, methods=['get'])
    def heatmap(self, request):
        data = Issue.objects.filter(is_spam=False).values('ward_number').annotate(
            total=Count('id'),
            pending=Count('id', filter=Q(status='pending')),
            resolved=Count('id', filter=Q(status='resolved')),
        ).order_by('ward_number')
        return Response(list(data))


# ── Departments ───────────────────────────────────────────────────────────────

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]


# ── Notifications ─────────────────────────────────────────────────────────────

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')
