from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Hospital, Department, Doctor, DoctorApplication, OPDSchedule, Bed, OperationTheater, EmergencyCapacity


class HospitalSerializer(serializers.ModelSerializer):
    """Serializer for Hospital model with map support"""
    admin_email = serializers.EmailField(source='admin.email', read_only=True)
    admin_name = serializers.CharField(source='admin.full_name', read_only=True)
    director_name = serializers.CharField(source='director.full_name', read_only=True)
    operations_manager_name = serializers.CharField(source='operations_manager.full_name', read_only=True)
    doctor_count = serializers.SerializerMethodField()
    bed_availability = serializers.SerializerMethodField()
    emergency_wait_time = serializers.SerializerMethodField()
    
    class Meta:
        model = Hospital
        fields = ['id', 'name', 'director', 'operations_manager', 'admin', 'admin_email', 
                  'admin_name', 'director_name', 'operations_manager_name', 'address', 'city', 
                  'state', 'pincode', 'latitude', 'longitude', 'phone', 'email', 'license_number', 
                  'is_active', 'is_approved', 'opd_open', 'emergency_available', 'subscription_tier',
                  'commission_rate', 'doctor_count', 'bed_availability', 'emergency_wait_time', 
                  'created_at']
        read_only_fields = ['id', 'created_at', 'doctor_count', 'bed_availability', 'emergency_wait_time']
    
    def get_doctor_count(self, obj):
        return obj.doctors.filter(is_active=True, is_approved=True).count()
    
    def get_bed_availability(self, obj):
        total_beds = obj.beds.count()
        available_beds = obj.beds.filter(is_available=True, is_occupied=False).count()
        return {
            'total': total_beds,
            'available': available_beds,
            'occupied': total_beds - available_beds
        }
    
    def get_emergency_wait_time(self, obj):
        try:
            return obj.emergency_capacity.wait_time_minutes
        except:
            return None


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    doctor_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'hospital', 'hospital_name', 'name', 'description', 'is_active', 
                  'doctor_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'doctor_count']
    
    def get_doctor_count(self, obj):
        return obj.doctors.filter(is_active=True).count()


class DoctorSerializer(serializers.ModelSerializer):
    """Serializer for Doctor model"""
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    doctor_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = Doctor
        fields = ['id', 'user', 'user_id', 'hospital', 'hospital_name', 'department', 
                  'department_name', 'specialization', 'qualification', 'license_number', 
                  'experience_years', 'consultation_fee', 'is_active', 'is_approved', 
                  'bio', 'doctor_name', 'created_at']
        read_only_fields = ['id', 'created_at']


class DoctorApplicationSerializer(serializers.ModelSerializer):
    """Serializer for Doctor Application"""
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    hospital = HospitalSerializer(read_only=True)
    hospital_id = serializers.IntegerField(write_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True, required=False)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    doctor_name = serializers.CharField(source='user.full_name', read_only=True)
    doctor_email = serializers.EmailField(source='user.email', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)
    
    class Meta:
        model = DoctorApplication
        fields = ['id', 'user', 'user_id', 'hospital', 'hospital_id', 'department', 'department_id',
                  'hospital_name', 'specialization', 'qualification', 'license_number', 
                  'experience_years', 'consultation_fee', 'bio', 'status', 'applied_at', 
                  'reviewed_at', 'reviewed_by', 'reviewed_by_name', 'notes', 'doctor_name', 
                  'doctor_email']
        read_only_fields = ['id', 'applied_at', 'reviewed_at', 'reviewed_by', 'status']


class BedSerializer(serializers.ModelSerializer):
    """Serializer for Bed"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    class Meta:
        model = Bed
        fields = ['id', 'hospital', 'hospital_name', 'bed_number', 'bed_type', 'ward',
                  'is_available', 'is_occupied', 'created_at']
        read_only_fields = ['id', 'created_at']


class OperationTheaterSerializer(serializers.ModelSerializer):
    """Serializer for Operation Theater"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    class Meta:
        model = OperationTheater
        fields = ['id', 'hospital', 'hospital_name', 'name', 'ot_number', 'is_available', 'created_at']
        read_only_fields = ['id', 'created_at']


class EmergencyCapacitySerializer(serializers.ModelSerializer):
    """Serializer for Emergency Capacity"""
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    
    class Meta:
        model = EmergencyCapacity
        fields = ['id', 'hospital', 'hospital_name', 'total_capacity', 'current_occupancy',
                  'wait_time_minutes', 'ventilators_available', 'ventilators_total', 'last_updated']
        read_only_fields = ['id', 'last_updated']


class OPDScheduleSerializer(serializers.ModelSerializer):
    """Serializer for OPD Schedule"""
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    hospital_name = serializers.CharField(source='doctor.hospital.name', read_only=True)
    
    class Meta:
        model = OPDSchedule
        fields = ['id', 'doctor', 'doctor_name', 'hospital_name', 'day', 'start_time', 
                  'end_time', 'is_active', 'max_appointments']
        read_only_fields = ['id']
