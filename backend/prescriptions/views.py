from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Medicine, Prescription, PrescriptionMedicine, LabTestRecommendation
from .serializers import (
    MedicineSerializer, PrescriptionSerializer, PrescriptionCreateSerializer,
    PrescriptionMedicineSerializer, LabTestRecommendationSerializer
)
from users.permissions import IsDoctor, IsPatient
from users.models import AuditLog


class MedicineListCreateAPIView(generics.ListCreateAPIView):
    """List or create medicines"""
    queryset = Medicine.objects.filter(is_active=True)
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Medicine.objects.filter(is_active=True)
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                name__icontains=search
            ) | queryset.filter(
                generic_name__icontains=search
            )
        return queryset


class PrescriptionListCreateAPIView(generics.ListCreateAPIView):
    """List or create prescriptions"""
    queryset = Prescription.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PrescriptionCreateSerializer
        return PrescriptionSerializer
    
    def get_queryset(self):
        queryset = Prescription.objects.select_related('patient', 'doctor', 'appointment')
        
        # Patients can only see their own prescriptions
        if self.request.user.role == 'PATIENT':
            patient = getattr(self.request.user, 'patient_profile', None)
            if patient:
                queryset = queryset.filter(patient=patient)
            else:
                queryset = queryset.none()
        
        # Doctors can see their own prescriptions
        elif self.request.user.role == 'DOCTOR':
            doctor = getattr(self.request.user, 'doctor_profile', None)
            if doctor:
                queryset = queryset.filter(doctor=doctor)
            else:
                queryset = queryset.none()
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        # Only doctors can create prescriptions
        if self.request.user.role != 'DOCTOR':
            raise permissions.PermissionDenied("Only doctors can create prescriptions")
        
        doctor = getattr(self.request.user, 'doctor_profile', None)
        if not doctor:
            raise permissions.PermissionDenied("Doctor profile not found")
        
        prescription = serializer.save()
        
        # Log prescription creation
        AuditLog.objects.create(
            user=self.request.user,
            action='PRESCRIPTION_CREATED',
            resource_type='Prescription',
            resource_id=prescription.id,
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class PrescriptionDetailAPIView(generics.RetrieveAPIView):
    """Retrieve prescription details"""
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Prescription.objects.all()
        
        # Patients can only see their own prescriptions
        if self.request.user.role == 'PATIENT':
            patient = getattr(self.request.user, 'patient_profile', None)
            if patient:
                queryset = queryset.filter(patient=patient)
            else:
                queryset = queryset.none()
        
        # Doctors can see their own prescriptions
        elif self.request.user.role == 'DOCTOR':
            doctor = getattr(self.request.user, 'doctor_profile', None)
            if doctor:
                queryset = queryset.filter(doctor=doctor)
            else:
                queryset = queryset.none()
        
        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPatient])
def patient_prescriptions(request):
    """Get prescriptions for logged-in patient"""
    patient = getattr(request.user, 'patient_profile', None)
    if not patient:
        return Response({'error': 'Patient profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    prescriptions = Prescription.objects.filter(patient=patient).order_by('-created_at')
    serializer = PrescriptionSerializer(prescriptions, many=True)
    return Response(serializer.data)

