from rest_framework import serializers
from datetime import date
from users.serializers import UserSerializer
from hospitals.serializers import DoctorSerializer, HospitalSerializer, DepartmentSerializer
from .models import Patient, Appointment


class PatientSerializer(serializers.ModelSerializer):
    """Serializer for Patient model"""
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True, required=False)
    age = serializers.ReadOnlyField()
    
    class Meta:
        model = Patient
        fields = ['id', 'user', 'user_id', 'date_of_birth', 'gender', 'blood_group', 
                  'address', 'emergency_contact', 'emergency_contact_name', 'age',
                  'allergies', 'chronic_conditions', 'created_at']
        read_only_fields = ['id', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializer for Appointment model"""
    patient = PatientSerializer(read_only=True)
    patient_id = serializers.IntegerField(write_only=True, required=False)
    doctor = DoctorSerializer(read_only=True)
    doctor_id = serializers.IntegerField(write_only=True, required=False)
    hospital = HospitalSerializer(read_only=True)
    hospital_id = serializers.IntegerField(write_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.IntegerField(write_only=True, required=False)
    reviewed_by_name = serializers.CharField(source='reviewed_by.full_name', read_only=True)
    
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    hospital_name = serializers.CharField(source='hospital.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Appointment
        fields = ['id', 'patient', 'patient_id', 'doctor', 'doctor_id', 'hospital', 'hospital_id',
                  'department', 'department_id', 'appointment_type', 'appointment_date', 
                  'appointment_time', 'status', 'reason', 'priority', 'reviewed_by', 
                  'reviewed_by_name', 'reviewed_at', 'operations_notes', 'consultation_fee',
                  'platform_commission', 'is_walk_in', 'notes', 'patient_name', 'doctor_name',
                  'hospital_name', 'department_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'consultation_fee', 'platform_commission', 'reviewed_by',
                           'reviewed_at', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        appointment_date = attrs.get('appointment_date')
        appointment_time = attrs.get('appointment_time')
        
        if appointment_date and appointment_date < date.today():
            raise serializers.ValidationError("Appointment date cannot be in the past")
        
        return attrs
