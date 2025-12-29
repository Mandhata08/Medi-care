from django.db import models
from appointments.models import Patient, Appointment
from hospitals.models import Hospital, Doctor


class EMRRecord(models.Model):
    """Electronic Medical Record - Lifetime patient records"""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='emr_records')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='emr_records')
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='emr_record',
                                       null=True, blank=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='emr_records')
    
    visit_date = models.DateTimeField(auto_now_add=True)
    visit_type = models.CharField(max_length=50)  # OPD, Emergency, Follow-up, etc.
    
    # Clinical notes
    chief_complaint = models.TextField(blank=True)
    history_of_present_illness = models.TextField(blank=True)
    physical_examination = models.TextField(blank=True)
    diagnosis = models.TextField()
    treatment_plan = models.TextField(blank=True)
    clinical_notes = models.TextField(blank=True)
    
    # Vitals (can be recorded by nurse)
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_pressure_systolic = models.IntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.IntegerField(null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    respiratory_rate = models.IntegerField(null=True, blank=True)
    oxygen_saturation = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    # Recorded by
    recorded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True,
                                    related_name='recorded_emr')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'emr_records'
        indexes = [
            models.Index(fields=['patient', 'visit_date']),
            models.Index(fields=['hospital', 'visit_date']),
            models.Index(fields=['doctor', 'visit_date']),
        ]
        ordering = ['-visit_date']
    
    def __str__(self):
        return f"EMR - {self.patient.user.full_name} - {self.visit_date}"


class ClinicalNote(models.Model):
    """Additional clinical notes added by doctors"""
    emr_record = models.ForeignKey(EMRRecord, on_delete=models.CASCADE, related_name='doctor_notes')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, related_name='clinical_notes')
    note = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'clinical_notes'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note by {self.doctor.user.full_name if self.doctor else 'Unknown'}"


class VitalsRecord(models.Model):
    """Vitals recorded by nurses/medical assistants"""
    emr_record = models.ForeignKey(EMRRecord, on_delete=models.CASCADE, related_name='vitals_records')
    recorded_by = models.ForeignKey('users.User', on_delete=models.SET_NULL, null=True,
                                     related_name='recorded_vitals',
                                     limit_choices_to={'role__in': ['NURSE', 'MEDICAL_ASSISTANT']})
    
    temperature = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    blood_pressure_systolic = models.IntegerField(null=True, blank=True)
    blood_pressure_diastolic = models.IntegerField(null=True, blank=True)
    heart_rate = models.IntegerField(null=True, blank=True)
    respiratory_rate = models.IntegerField(null=True, blank=True)
    oxygen_saturation = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    notes = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'vitals_records'
        ordering = ['-recorded_at']
    
    def __str__(self):
        return f"Vitals - {self.recorded_at}"

