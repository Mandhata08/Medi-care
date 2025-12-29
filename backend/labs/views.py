from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Lab, LabTest, LabTestRequest, LabReport
from .serializers import LabSerializer, LabTestSerializer, LabTestRequestSerializer, LabReportSerializer
from users.permissions import IsLabAdmin, IsSuperAdmin
from users.models import AuditLog


class LabListCreateAPIView(generics.ListCreateAPIView):
    """List or create labs"""
    queryset = Lab.objects.all()
    serializer_class = LabSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Lab.objects.all()
        
        # Only show active and approved labs to non-admins
        if self.request.user.role not in ['SUPER_ADMIN', 'LAB_ADMIN']:
            queryset = queryset.filter(is_active=True, is_approved=True)
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        return queryset
    
    def perform_create(self, serializer):
        # Only Super Admin can create labs
        if self.request.user.role != 'SUPER_ADMIN':
            raise permissions.PermissionDenied("Only Super Admin can create labs")
        serializer.save()


class LabDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete lab"""
    queryset = Lab.objects.all()
    serializer_class = LabSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]


class LabTestListCreateAPIView(generics.ListCreateAPIView):
    """List or create lab tests"""
    queryset = LabTest.objects.filter(is_active=True)
    serializer_class = LabTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = LabTest.objects.filter(is_active=True)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class LabTestRequestListCreateAPIView(generics.ListCreateAPIView):
    """List or create lab test requests"""
    queryset = LabTestRequest.objects.all()
    serializer_class = LabTestRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = LabTestRequest.objects.select_related('lab', 'test', 'lab_test_recommendation')
        
        # Lab Admins can only see requests for their lab
        if self.request.user.role == 'LAB_ADMIN':
            lab = getattr(self.request.user, 'lab_admin', None)
            if lab:
                queryset = queryset.filter(lab=lab)
            else:
                queryset = queryset.none()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-requested_at')
    
    def perform_create(self, serializer):
        # Lab Admin can only create requests for their lab
        if self.request.user.role == 'LAB_ADMIN':
            lab = getattr(self.request.user, 'lab_admin', None)
            if not lab:
                raise permissions.PermissionDenied("Lab Admin must be associated with a lab")
            serializer.save(lab=lab)
        else:
            serializer.save()


class LabTestRequestDetailAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve or update lab test request"""
    queryset = LabTestRequest.objects.all()
    serializer_class = LabTestRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)
        
        # Only Lab Admin can update status
        if self.request.user.role != 'LAB_ADMIN':
            raise permissions.PermissionDenied("Only Lab Admin can update test requests")
        
        # Check if lab admin owns this lab
        lab = getattr(self.request.user, 'lab_admin', None)
        if not lab or instance.lab != lab:
            raise permissions.PermissionDenied("Can only update requests for your lab")
        
        if new_status == 'COMPLETED' and old_status != 'COMPLETED':
            from django.utils import timezone
            serializer.validated_data['completed_at'] = timezone.now()
        
        serializer.save()


class LabReportListCreateAPIView(generics.ListCreateAPIView):
    """List or create lab reports"""
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def get_queryset(self):
        queryset = LabReport.objects.select_related('lab_test_request')
        
        # Lab Admins can only see reports from their lab
        if self.request.user.role == 'LAB_ADMIN':
            lab = getattr(self.request.user, 'lab_admin', None)
            if lab:
                queryset = queryset.filter(lab_test_request__lab=lab)
            else:
                queryset = queryset.none()
        
        return queryset.order_by('-uploaded_at')
    
    def perform_create(self, serializer):
        # Only Lab Admin can upload reports
        if self.request.user.role != 'LAB_ADMIN':
            raise permissions.PermissionDenied("Only Lab Admin can upload reports")
        
        lab_test_request_id = serializer.validated_data.get('lab_test_request_id')
        lab_test_request = LabTestRequest.objects.get(id=lab_test_request_id)
        
        # Check if lab admin owns this lab
        lab = getattr(self.request.user, 'lab_admin', None)
        if not lab or lab_test_request.lab != lab:
            raise permissions.PermissionDenied("Can only upload reports for your lab")
        
        report = serializer.save(lab_test_request=lab_test_request)
        
        # Update test request status
        lab_test_request.status = 'COMPLETED'
        lab_test_request.save()
        
        # Update lab test recommendation status
        lab_test_request.lab_test_recommendation.is_completed = True
        lab_test_request.lab_test_recommendation.save()
        
        # Log report upload
        AuditLog.objects.create(
            user=self.request.user,
            action='LAB_REPORT_UPLOADED',
            resource_type='LabReport',
            resource_id=report.id,
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class LabReportDetailAPIView(generics.RetrieveAPIView):
    """Retrieve lab report"""
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

