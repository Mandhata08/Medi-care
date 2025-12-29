from django.db import models
from appointments.models import Appointment, Patient
from hospitals.models import Doctor
from emr.models import EMRRecord


class Medicine(models.Model):
    """Medicine catalog"""
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    manufacturer = models.CharField(max_length=200, blank=True)
    dosage_form = models.CharField(max_length=50, blank=True)  # Tablet, Syrup, etc.
    strength = models.CharField(max_length=50, blank=True)  # 500mg, 10ml, etc.
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'medicines'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.strength})"


class Prescription(models.Model):
    """Prescription model - linked to EMR"""
    emr_record = models.OneToOneField(EMRRecord, on_delete=models.CASCADE, related_name='prescription',
                                      null=True, blank=True)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='prescription',
                                       null=True, blank=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='prescriptions')
    diagnosis = models.TextField()
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'prescriptions'
        indexes = [
            models.Index(fields=['patient', 'created_at']),
            models.Index(fields=['doctor', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Prescription #{self.id} - {self.patient.user.full_name}"


class PrescriptionMedicine(models.Model):
    """Medicine details in prescription"""
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='medicines')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    dosage = models.CharField(max_length=100)  # e.g., "1 tablet"
    frequency = models.CharField(max_length=100)  # e.g., "Twice daily", "After meals"
    duration = models.CharField(max_length=100)  # e.g., "7 days", "2 weeks"
    instructions = models.TextField(blank=True)
    quantity = models.IntegerField(default=1)
    
    class Meta:
        db_table = 'prescription_medicines'
        unique_together = ['prescription', 'medicine']
    
    def __str__(self):
        return f"{self.medicine.name} - {self.prescription}"


class LabTestRecommendation(models.Model):
    """Lab test recommendations from prescriptions"""
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='lab_tests')
    test_name = models.CharField(max_length=200)
    test_description = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lab_test_recommendations'
        indexes = [
            models.Index(fields=['prescription', 'is_completed']),
        ]
    
    def __str__(self):
        return f"{self.test_name} - {self.prescription}"
