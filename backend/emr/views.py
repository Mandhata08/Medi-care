from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from .models import EMRRecord, ClinicalNote, VitalsRecord
from .serializers import EMRRecordSerializer, ClinicalNoteSerializer, VitalsRecordSerializer
from users.permissions import IsDoctor, IsPatient
from hospitals.permissions import IsOperationsManager
from users.models import AuditLog


class EMRRecordListCreateAPIView(generics.ListCreateAPIView):
    """List or create EMR records"""
    queryset = EMRRecord.objects.all()
    serializer_class = EMRRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = EMRRecord.objects.select_related('patient', 'doctor', 'hospital')
        
        # Patients can only see their own records
        if self.request.user.role == 'PATIENT':
            patient = getattr(self.request.user, 'patient_profile', None)
            if patient:
                queryset = queryset.filter(patient=patient)
            else:
                queryset = queryset.none()
        
        # Doctors can see records they created
        elif self.request.user.role == 'DOCTOR':
            doctor = getattr(self.request.user, 'doctor_profile', None)
            if doctor:
                queryset = queryset.filter(doctor=doctor)
            else:
                queryset = queryset.none()
        
        # Hospital staff can see records from their hospital
        elif self.request.user.role in ['HOSPITAL_ADMIN', 'OPERATIONS_MANAGER', 'HOSPITAL_DIRECTOR']:
            hospital = getattr(self.request.user, 'hospital_admin', None) or \
                      getattr(self.request.user, 'hospital_director', None)
            if hospital:
                queryset = queryset.filter(hospital=hospital)
            else:
                queryset = queryset.none()
        
        return queryset.order_by('-visit_date')
    
    def perform_create(self, serializer):
        # Only doctors can create EMR records
        if self.request.user.role != 'DOCTOR':
            raise permissions.PermissionDenied("Only doctors can create EMR records")
        
        doctor = getattr(self.request.user, 'doctor_profile', None)
        if not doctor:
            raise permissions.PermissionDenied("Doctor profile not found")
        
        emr = serializer.save(doctor=doctor, recorded_by=self.request.user)
        
        # Log EMR creation
        AuditLog.objects.create(
            user=self.request.user,
            action='EMR_CREATED',
            resource_type='EMRRecord',
            resource_id=emr.id,
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class EMRRecordDetailAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve or update EMR record"""
    queryset = EMRRecord.objects.all()
    serializer_class = EMRRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = EMRRecord.objects.all()
        
        if self.request.user.role == 'PATIENT':
            patient = getattr(self.request.user, 'patient_profile', None)
            if patient:
                queryset = queryset.filter(patient=patient)
            else:
                queryset = queryset.none()
        
        return queryset


class PatientEMRListAPIView(generics.ListAPIView):
    """Get all EMR records for a patient (lifetime records)"""
    serializer_class = EMRRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from appointments.models import Patient
        patient_id = self.kwargs.get('patient_id')
        
        try:
            patient = Patient.objects.get(id=patient_id)
            
            # Check permissions
            if self.request.user.role == 'PATIENT':
                user_patient = getattr(self.request.user, 'patient_profile', None)
                if not user_patient or user_patient.id != patient_id:
                    return EMRRecord.objects.none()
            
            records = EMRRecord.objects.filter(patient=patient).order_by('-visit_date')
            
            # Log access
            AuditLog.objects.create(
                user=self.request.user,
                action='EMR_ACCESSED',
                resource_type='Patient',
                resource_id=patient_id,
                ip_address=self.request.META.get('REMOTE_ADDR')
            )
            
            return records
        except Patient.DoesNotExist:
            return EMRRecord.objects.none()


class VitalsRecordListCreateAPIView(generics.ListCreateAPIView):
    """List or create vitals records (Nurse/Medical Assistant)"""
    queryset = VitalsRecord.objects.all()
    serializer_class = VitalsRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        # Only nurses and medical assistants can record vitals
        if self.request.user.role not in ['NURSE', 'MEDICAL_ASSISTANT']:
            raise permissions.PermissionDenied("Only nurses or medical assistants can record vitals")
        
        serializer.save(recorded_by=self.request.user)
