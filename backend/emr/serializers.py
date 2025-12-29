from rest_framework import serializers
from appointments.serializers import PatientSerializer
from hospitals.serializers import DoctorSerializer, HospitalSerializer
from .models import EMRRecord, ClinicalNote, VitalsRecord


class VitalsRecordSerializer(serializers.ModelSerializer):
    """Serializer for Vitals Record"""
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)
    
    class Meta:
        model = VitalsRecord
        fields = ['id', 'emr_record', 'recorded_by', 'recorded_by_name', 'temperature',
                  'blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate',
                  'respiratory_rate', 'oxygen_saturation', 'weight', 'height', 'notes', 'recorded_at']
        read_only_fields = ['id', 'recorded_at']


class ClinicalNoteSerializer(serializers.ModelSerializer):
    """Serializer for Clinical Note"""
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    
    class Meta:
        model = ClinicalNote
        fields = ['id', 'emr_record', 'doctor', 'doctor_name', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']


class EMRRecordSerializer(serializers.ModelSerializer):
    """Serializer for EMR Record"""
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    hospital = HospitalSerializer(read_only=True)
    doctor_notes = ClinicalNoteSerializer(source='doctor_notes', many=True, read_only=True)
    vitals_records = VitalsRecordSerializer(many=True, read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.full_name', read_only=True)
    
    class Meta:
        model = EMRRecord
        fields = ['id', 'patient', 'hospital', 'appointment', 'doctor', 'visit_date', 'visit_type',
                  'chief_complaint', 'history_of_present_illness', 'physical_examination', 'diagnosis',
                  'treatment_plan', 'clinical_notes', 'temperature', 'blood_pressure_systolic',
                  'blood_pressure_diastolic', 'heart_rate', 'respiratory_rate', 'oxygen_saturation',
                  'weight', 'height', 'recorded_by', 'recorded_by_name', 'vitals_records',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'visit_date', 'created_at', 'updated_at']

