from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from math import radians, cos, sin, asin, sqrt
from .models import Hospital, Department, Doctor, DoctorApplication, OPDSchedule, Bed, OperationTheater, EmergencyCapacity
from .serializers import (
    HospitalSerializer, DepartmentSerializer, DoctorSerializer, DoctorApplicationSerializer,
    OPDScheduleSerializer, BedSerializer, OperationTheaterSerializer, EmergencyCapacitySerializer
)
from .permissions import IsHospitalAdmin, IsSuperAdmin, IsOperationsManager
from users.models import AuditLog


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth radius in kilometers
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    return R * c


class HospitalListCreateAPIView(generics.ListCreateAPIView):
    """List all hospitals with map-based discovery"""
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.AllowAny]  # Public for discovery
    
    def get_queryset(self):
        queryset = Hospital.objects.filter(is_active=True, is_approved=True)
        
        # Map-based filters
        latitude = self.request.query_params.get('latitude', None)
        longitude = self.request.query_params.get('longitude', None)
        radius_km = self.request.query_params.get('radius', 50)  # Default 50km radius
        
        # Filter by city, state, or name
        city = self.request.query_params.get('city', None)
        state = self.request.query_params.get('state', None)
        search = self.request.query_params.get('search', None)
        
        # Specialization filter
        specialization = self.request.query_params.get('specialization', None)
        
        # Status filters
        emergency_available = self.request.query_params.get('emergency_available', None)
        opd_open = self.request.query_params.get('opd_open', None)
        icu_available = self.request.query_params.get('icu_available', None)
        open_now = self.request.query_params.get('open_now', None)
        
        if city:
            queryset = queryset.filter(city__icontains=city)
        if state:
            queryset = queryset.filter(state__icontains=state)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(city__icontains=search)
            )
        if emergency_available == 'true':
            queryset = queryset.filter(emergency_available=True)
        if opd_open == 'true':
            queryset = queryset.filter(opd_open=True)
        if icu_available == 'true':
            queryset = queryset.filter(beds__bed_type='ICU', beds__is_available=True).distinct()
        if open_now == 'true':
            # Check if current time is within OPD hours (simplified)
            queryset = queryset.filter(opd_open=True)
        
        # Distance-based filtering
        if latitude and longitude:
            try:
                lat = float(latitude)
                lon = float(longitude)
                radius = float(radius_km)
                
                # Filter hospitals within radius
                nearby_hospitals = []
                for hospital in queryset:
                    if hospital.latitude and hospital.longitude:
                        distance = calculate_distance(lat, lon, float(hospital.latitude), float(hospital.longitude))
                        if distance <= radius:
                            nearby_hospitals.append(hospital.id)
                
                queryset = queryset.filter(id__in=nearby_hospitals)
            except (ValueError, TypeError):
                pass
        
        # Filter by specialization if provided
        if specialization:
            queryset = queryset.filter(doctors__specialization__icontains=specialization,
                                      doctors__is_active=True, doctors__is_approved=True).distinct()
        
        return queryset
    
    def perform_create(self, serializer):
        # Only Super Admin can create hospitals
        if self.request.user.role != 'SUPER_ADMIN':
            raise permissions.PermissionDenied("Only Super Admin can create hospitals")
        serializer.save()


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def hospital_map_discovery(request):
    """Map-based hospital discovery with filters"""
    latitude = request.query_params.get('latitude')
    longitude = request.query_params.get('longitude')
    radius = float(request.query_params.get('radius', 50))
    
    specialization = request.query_params.get('specialization')
    emergency = request.query_params.get('emergency_available') == 'true'
    opd_open = request.query_params.get('opd_open') == 'true'
    icu = request.query_params.get('icu_available') == 'true'
    
    queryset = Hospital.objects.filter(is_active=True, is_approved=True)
    
    if latitude and longitude:
        lat = float(latitude)
        lon = float(longitude)
        nearby = []
        for hospital in queryset:
            if hospital.latitude and hospital.longitude:
                dist = calculate_distance(lat, lon, float(hospital.latitude), float(hospital.longitude))
                if dist <= radius:
                    nearby.append(hospital.id)
        queryset = queryset.filter(id__in=nearby)
    
    if specialization:
        queryset = queryset.filter(doctors__specialization__icontains=specialization).distinct()
    if emergency:
        queryset = queryset.filter(emergency_available=True)
    if opd_open:
        queryset = queryset.filter(opd_open=True)
    if icu:
        queryset = queryset.filter(beds__bed_type='ICU', beds__is_available=True).distinct()
    
    serializer = HospitalSerializer(queryset, many=True)
    return Response(serializer.data)


class HospitalDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a hospital"""
    queryset = Hospital.objects.all()
    serializer_class = HospitalSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.AllowAny()]


class DepartmentListCreateAPIView(generics.ListCreateAPIView):
    """List or create departments"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Department.objects.filter(is_active=True)
        hospital_id = self.request.query_params.get('hospital', None)
        if hospital_id:
            queryset = queryset.filter(hospital_id=hospital_id)
        return queryset


class DoctorListCreateAPIView(generics.ListCreateAPIView):
    """List all doctors"""
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Doctor.objects.filter(is_active=True, is_approved=True)
        
        hospital_id = self.request.query_params.get('hospital', None)
        department_id = self.request.query_params.get('department', None)
        specialization = self.request.query_params.get('specialization', None)
        search = self.request.query_params.get('search', None)
        
        if hospital_id:
            queryset = queryset.filter(hospital_id=hospital_id)
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)
        if search:
            queryset = queryset.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(specialization__icontains=search)
            )
        
        return queryset


class DoctorApplicationListCreateAPIView(generics.ListCreateAPIView):
    """List or create doctor applications"""
    queryset = DoctorApplication.objects.all()
    serializer_class = DoctorApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = DoctorApplication.objects.select_related('user', 'hospital', 'reviewed_by', 'department')
        
        if self.request.user.role == 'DOCTOR':
            queryset = queryset.filter(user=self.request.user)
        elif self.request.user.role == 'HOSPITAL_ADMIN':
            hospital = getattr(self.request.user, 'hospital_admin', None)
            if hospital:
                queryset = queryset.filter(hospital=hospital)
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-applied_at')
    
    def perform_create(self, serializer):
        if self.request.user.role != 'DOCTOR':
            raise permissions.PermissionDenied("Only doctors can apply")
        
        hospital_id = serializer.validated_data.get('hospital_id')
        existing = DoctorApplication.objects.filter(
            user=self.request.user,
            hospital_id=hospital_id,
            status='PENDING'
        ).exists()
        
        if existing:
            raise permissions.PermissionDenied("You already have a pending application")
        
        serializer.save(user=self.request.user, status='PENDING')


class DoctorApplicationDetailAPIView(generics.RetrieveUpdateAPIView):
    """Review doctor application"""
    queryset = DoctorApplication.objects.all()
    serializer_class = DoctorApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_update(self, serializer):
        application = self.get_object()
        old_status = application.status
        
        if self.request.user.role != 'HOSPITAL_ADMIN':
            raise permissions.PermissionDenied("Only Hospital Admin can review")
        
        hospital = getattr(self.request.user, 'hospital_admin', None)
        if not hospital or application.hospital != hospital:
            raise permissions.PermissionDenied("Can only review applications for your hospital")
        
        new_status = serializer.validated_data.get('status', old_status)
        
        if new_status == 'APPROVED' and old_status != 'APPROVED':
            if not Doctor.objects.filter(user=application.user).exists():
                Doctor.objects.create(
                    user=application.user,
                    hospital=application.hospital,
                    department=application.department,
                    specialization=application.specialization,
                    qualification=application.qualification,
                    license_number=application.license_number,
                    experience_years=application.experience_years,
                    consultation_fee=application.consultation_fee,
                    bio=application.bio,
                    is_approved=True,
                    is_active=True
                )
            serializer.validated_data['reviewed_at'] = timezone.now()
            serializer.validated_data['reviewed_by'] = self.request.user
        elif new_status == 'REJECTED':
            serializer.validated_data['reviewed_at'] = timezone.now()
            serializer.validated_data['reviewed_by'] = self.request.user
        
        serializer.save()


class BedListCreateAPIView(generics.ListCreateAPIView):
    """List or create beds"""
    queryset = Bed.objects.all()
    serializer_class = BedSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Bed.objects.all()
        hospital_id = self.request.query_params.get('hospital', None)
        bed_type = self.request.query_params.get('bed_type', None)
        available_only = self.request.query_params.get('available', None)
        
        if hospital_id:
            queryset = queryset.filter(hospital_id=hospital_id)
        if bed_type:
            queryset = queryset.filter(bed_type=bed_type)
        if available_only == 'true':
            queryset = queryset.filter(is_available=True, is_occupied=False)
        
        return queryset


class OperationTheaterListCreateAPIView(generics.ListCreateAPIView):
    """List or create operation theaters"""
    queryset = OperationTheater.objects.all()
    serializer_class = OperationTheaterSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = OperationTheater.objects.all()
        hospital_id = self.request.query_params.get('hospital', None)
        if hospital_id:
            queryset = queryset.filter(hospital_id=hospital_id)
        return queryset


class EmergencyCapacityDetailAPIView(generics.RetrieveUpdateAPIView):
    """Get or update emergency capacity"""
    queryset = EmergencyCapacity.objects.all()
    serializer_class = EmergencyCapacitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            return [permissions.IsAuthenticated(), IsOperationsManager() or IsHospitalAdmin()]
        return [permissions.AllowAny()]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsSuperAdmin])
def approve_doctor(request, doctor_id):
    """Approve a doctor (Super Admin only)"""
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        doctor.is_approved = True
        doctor.save()
        
        AuditLog.objects.create(
            user=request.user,
            action='DOCTOR_APPROVED',
            resource_type='Doctor',
            resource_id=doctor.id,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({'message': 'Doctor approved successfully'}, status=status.HTTP_200_OK)
    except Doctor.DoesNotExist:
        return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)


class OPDScheduleListCreateAPIView(generics.ListCreateAPIView):
    """List or create OPD schedules"""
    queryset = OPDSchedule.objects.all()
    serializer_class = OPDScheduleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = OPDSchedule.objects.filter(is_active=True)
        doctor_id = self.request.query_params.get('doctor', None)
        
        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)
        
        return queryset
    
    def perform_create(self, serializer):
        if self.request.user.role == 'HOSPITAL_ADMIN':
            hospital = getattr(self.request.user, 'hospital_admin', None)
            if not hospital:
                raise permissions.PermissionDenied("Hospital Admin must be associated with a hospital")
            doctor = serializer.validated_data['doctor']
            if doctor.hospital != hospital:
                raise permissions.PermissionDenied("Can only create schedules for doctors in your hospital")
        serializer.save()


class OPDScheduleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete OPD schedule"""
    queryset = OPDSchedule.objects.all()
    serializer_class = OPDScheduleSerializer
    permission_classes = [permissions.IsAuthenticated, IsHospitalAdmin]
