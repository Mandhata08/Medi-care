from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from datetime import date, timedelta
from .models import Patient, Appointment, AppointmentQueue
from .serializers import PatientSerializer, AppointmentSerializer
from users.models import AuditLog
from users.permissions import IsPatient, IsDoctor
from hospitals.permissions import IsOperationsManager


class PatientListCreateAPIView(generics.ListCreateAPIView):
    """List or create patients"""
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Patients can only see their own profile
        if self.request.user.role == 'PATIENT':
            return Patient.objects.filter(user=self.request.user)
        # Doctors, Operations Managers, and Hospital staff can see all patients
        return Patient.objects.all()
    
    def perform_create(self, serializer):
        # Auto-assign user if patient is creating their profile
        if self.request.user.role == 'PATIENT':
            serializer.save(user=self.request.user)
        else:
            serializer.save()


class PatientDetailAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve or update patient profile"""
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Patients can only see their own profile
        if self.request.user.role == 'PATIENT':
            return Patient.objects.filter(user=self.request.user)
        return Patient.objects.all()


class AppointmentListCreateAPIView(generics.ListCreateAPIView):
    """List or create appointments - Operations Manager approves"""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Appointment.objects.select_related('patient', 'doctor', 'hospital', 'department')
        
        # Patients can only see their own appointments
        if self.request.user.role == 'PATIENT':
            patient = getattr(self.request.user, 'patient_profile', None)
            if patient:
                queryset = queryset.filter(patient=patient)
            else:
                queryset = queryset.none()
        
        # Doctors can only see their assigned appointments
        elif self.request.user.role == 'DOCTOR':
            doctor = getattr(self.request.user, 'doctor_profile', None)
            if doctor:
                queryset = queryset.filter(doctor=doctor)
            else:
                queryset = queryset.none()
        
        # Operations Manager sees all appointments for their hospital
        elif self.request.user.role == 'OPERATIONS_MANAGER':
            # Get hospitals managed by this operations manager
            hospitals = getattr(self.request.user, 'managed_hospitals', None)
            if hospitals:
                queryset = queryset.filter(hospital__in=hospitals.all())
            else:
                queryset = queryset.none()
        
        # Hospital Director/Admin see all appointments for their hospital
        elif self.request.user.role in ['HOSPITAL_DIRECTOR', 'HOSPITAL_ADMIN']:
            hospital = getattr(self.request.user, 'hospital_admin', None) or getattr(self.request.user, 'hospital_director', None)
            if hospital:
                queryset = queryset.filter(hospital=hospital)
            else:
                queryset = queryset.none()
        
        # Filter by status, date
        status_filter = self.request.query_params.get('status', None)
        date_filter = self.request.query_params.get('date', None)
        upcoming = self.request.query_params.get('upcoming', None)
        hospital_id = self.request.query_params.get('hospital', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if date_filter:
            queryset = queryset.filter(appointment_date=date_filter)
        if upcoming == 'true':
            queryset = queryset.filter(appointment_date__gte=date.today())
        if hospital_id:
            queryset = queryset.filter(hospital_id=hospital_id)
        
        return queryset.order_by('appointment_date', 'appointment_time')
    
    def perform_create(self, serializer):
        # Only patients can book appointments
        if self.request.user.role != 'PATIENT':
            raise permissions.PermissionDenied("Only patients can book appointments")
        
        patient = getattr(self.request.user, 'patient_profile', None)
        if not patient:
            # Create patient profile if it doesn't exist
            patient = Patient.objects.create(user=self.request.user)
        
        hospital_id = serializer.validated_data.get('hospital_id')
        from hospitals.models import Hospital
        hospital = Hospital.objects.get(id=hospital_id)
        
        appointment = serializer.save(
            patient=patient,
            hospital=hospital,
            status='REQUESTED'  # Start with REQUESTED, Operations Manager will review
        )
        
        # Log appointment booking
        AuditLog.objects.create(
            user=self.request.user,
            action='APPOINTMENT_REQUESTED',
            resource_type='Appointment',
            resource_id=appointment.id,
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class AppointmentDetailAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve or update appointment"""
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Appointment.objects.all()
        
        # Patients can only see their own appointments
        if self.request.user.role == 'PATIENT':
            patient = getattr(self.request.user, 'patient_profile', None)
            if patient:
                queryset = queryset.filter(patient=patient)
            else:
                queryset = queryset.none()
        
        # Doctors can see their assigned appointments
        elif self.request.user.role == 'DOCTOR':
            doctor = getattr(self.request.user, 'doctor_profile', None)
            if doctor:
                queryset = queryset.filter(doctor=doctor)
            else:
                queryset = queryset.none()
        
        # Operations Manager can see all appointments for their hospitals
        elif self.request.user.role == 'OPERATIONS_MANAGER':
            hospitals = getattr(self.request.user, 'managed_hospitals', None)
            if hospitals:
                queryset = queryset.filter(hospital__in=hospitals.all())
            else:
                queryset = queryset.none()
        
        return queryset
    
    def perform_update(self, serializer):
        appointment = self.get_object()
        old_status = appointment.status
        
        # Only Operations Manager can approve/assign appointments
        if self.request.user.role == 'OPERATIONS_MANAGER':
            new_status = serializer.validated_data.get('status', old_status)
            
            # Operations Manager can review and assign
            if new_status in ['REVIEWED', 'ASSIGNED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED']:
                serializer.validated_data['reviewed_by'] = self.request.user
                serializer.validated_data['reviewed_at'] = timezone.now()
            
            # If assigning to doctor, update status
            if 'doctor_id' in serializer.validated_data and new_status == 'ASSIGNED':
                serializer.validated_data['status'] = 'ASSIGNED'
        
        # Doctors can only update their own appointments to IN_PROGRESS or COMPLETED
        elif self.request.user.role == 'DOCTOR':
            doctor = getattr(self.request.user, 'doctor_profile', None)
            if appointment.doctor != doctor:
                raise permissions.PermissionDenied("Can only update your assigned appointments")
            
            new_status = serializer.validated_data.get('status', old_status)
            if new_status not in ['IN_PROGRESS', 'COMPLETED']:
                raise permissions.PermissionDenied("Doctors can only mark appointments as In Progress or Completed")
        
        serializer.save()
        
        # Log status change
        if old_status != serializer.validated_data.get('status', old_status):
            AuditLog.objects.create(
                user=self.request.user,
                action=f'APPOINTMENT_{serializer.validated_data.get("status", old_status)}',
                resource_type='Appointment',
                resource_id=appointment.id,
                ip_address=self.request.META.get('REMOTE_ADDR')
            )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsOperationsManager])
def operations_appointments(request):
    """Get all appointments for Operations Manager to review"""
    hospitals = getattr(request.user, 'managed_hospitals', None)
    if not hospitals:
        return Response({'error': 'No hospitals assigned'}, status=status.HTTP_404_NOT_FOUND)
    
    status_filter = request.query_params.get('status', 'REQUESTED')
    appointments = Appointment.objects.filter(
        hospital__in=hospitals.all(),
        status=status_filter
    ).order_by('appointment_date', 'appointment_time')
    
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsOperationsManager])
def assign_appointment(request, appointment_id):
    """Operations Manager assigns appointment to doctor"""
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        
        # Verify Operations Manager manages this hospital
        hospitals = getattr(request.user, 'managed_hospitals', None)
        if not hospitals or appointment.hospital not in hospitals.all():
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        doctor_id = request.data.get('doctor_id')
        department_id = request.data.get('department_id')
        notes = request.data.get('notes', '')
        
        from hospitals.models import Doctor, Department
        
        if doctor_id:
            doctor = Doctor.objects.get(id=doctor_id)
            appointment.doctor = doctor
        
        if department_id:
            department = Department.objects.get(id=department_id)
            appointment.department = department
        
        appointment.status = 'ASSIGNED'
        appointment.reviewed_by = request.user
        appointment.reviewed_at = timezone.now()
        appointment.operations_notes = notes
        appointment.save()
        
        # Log assignment
        AuditLog.objects.create(
            user=request.user,
            action='APPOINTMENT_ASSIGNED',
            resource_type='Appointment',
            resource_id=appointment.id,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Appointment assigned successfully'}, status=status.HTTP_200_OK)
    
    except Appointment.DoesNotExist:
        return Response({'error': 'Appointment not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPatient])
def patient_appointments(request):
    """Get appointments for logged-in patient"""
    patient = getattr(request.user, 'patient_profile', None)
    if not patient:
        # Auto-create patient profile if it doesn't exist
        patient = Patient.objects.create(user=request.user)
    
    appointments = Appointment.objects.filter(patient=patient).order_by('-appointment_date', '-appointment_time')
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsDoctor])
def doctor_appointments(request):
    """Get appointments for logged-in doctor"""
    doctor = getattr(request.user, 'doctor_profile', None)
    if not doctor:
        return Response({'error': 'Doctor profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    appointments = Appointment.objects.filter(doctor=doctor).order_by('appointment_date', 'appointment_time')
    serializer = AppointmentSerializer(appointments, many=True)
    return Response(serializer.data)
