from rest_framework import serializers
from appointments.serializers import PatientSerializer, AppointmentSerializer
from hospitals.serializers import DoctorSerializer
from .models import Medicine, Prescription, PrescriptionMedicine, LabTestRecommendation


class MedicineSerializer(serializers.ModelSerializer):
    """Serializer for Medicine model"""
    class Meta:
        model = Medicine
        fields = ['id', 'name', 'generic_name', 'manufacturer', 'dosage_form', 
                  'strength', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    """Serializer for PrescriptionMedicine"""
    medicine = MedicineSerializer(read_only=True)
    medicine_id = serializers.IntegerField(write_only=True)
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    
    class Meta:
        model = PrescriptionMedicine
        fields = ['id', 'medicine', 'medicine_id', 'medicine_name', 'dosage', 
                  'frequency', 'duration', 'instructions', 'quantity']
        read_only_fields = ['id']


class LabTestRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for LabTestRecommendation"""
    class Meta:
        model = LabTestRecommendation
        fields = ['id', 'test_name', 'test_description', 'is_completed', 'created_at']
        read_only_fields = ['id', 'created_at']


class PrescriptionSerializer(serializers.ModelSerializer):
    """Serializer for Prescription model"""
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    appointment = AppointmentSerializer(read_only=True)
    appointment_id = serializers.IntegerField(write_only=True, required=False)
    medicines = PrescriptionMedicineSerializer(many=True, read_only=True)
    lab_tests = LabTestRecommendationSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source='patient.user.full_name', read_only=True)
    doctor_name = serializers.CharField(source='doctor.user.full_name', read_only=True)
    
    class Meta:
        model = Prescription
        fields = ['id', 'appointment', 'appointment_id', 'patient', 'doctor', 
                  'diagnosis', 'notes', 'medicines', 'lab_tests', 'patient_name', 
                  'doctor_name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'patient', 'doctor', 'created_at', 'updated_at']


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating prescription with medicines and lab tests"""
    medicines = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    lab_tests = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Prescription
        fields = ['appointment_id', 'diagnosis', 'notes', 'medicines', 'lab_tests']
    
    def create(self, validated_data):
        medicines_data = validated_data.pop('medicines', [])
        lab_tests_data = validated_data.pop('lab_tests', [])
        
        appointment_id = validated_data.pop('appointment_id')
        from appointments.models import Appointment
        appointment = Appointment.objects.get(id=appointment_id)
        
        prescription = Prescription.objects.create(
            appointment=appointment,
            patient=appointment.patient,
            doctor=appointment.doctor,
            **validated_data
        )
        
        # Create prescription medicines
        for medicine_data in medicines_data:
            PrescriptionMedicine.objects.create(
                prescription=prescription,
                medicine_id=medicine_data['medicine_id'],
                dosage=medicine_data.get('dosage', ''),
                frequency=medicine_data.get('frequency', ''),
                duration=medicine_data.get('duration', ''),
                instructions=medicine_data.get('instructions', ''),
                quantity=medicine_data.get('quantity', 1)
            )
        
        # Create lab test recommendations
        for test_data in lab_tests_data:
            LabTestRecommendation.objects.create(
                prescription=prescription,
                test_name=test_data.get('test_name', ''),
                test_description=test_data.get('test_description', '')
            )
        
        # Update appointment status to completed
        appointment.status = 'COMPLETED'
        appointment.save()
        
        return prescription

