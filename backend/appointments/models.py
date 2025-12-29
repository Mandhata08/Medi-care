from django.db import models
from django.core.validators import MinValueValidator
from datetime import date, time
from users.models import User
from hospitals.models import Doctor, Hospital, Department


class Patient(models.Model):
    """Patient profile model - Hospital-agnostic lifetime records"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile',
                                limit_choices_to={'role': 'PATIENT'})
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female'), ('O', 'Other')], blank=True)
    blood_group = models.CharField(max_length=5, blank=True)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=20, blank=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    
    # Medical information
    allergies = models.JSONField(default=list, blank=True)  # List of allergies
    chronic_conditions = models.JSONField(default=list, blank=True)  # List of chronic conditions
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'patients'
    
    def __str__(self):
        return f"{self.user.full_name} (Patient)"
    
    @property
    def age(self):
        if self.date_of_birth:
            today = date.today()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None


class Appointment(models.Model):
    """Appointment model with Operations Manager approval"""
    STATUS_CHOICES = [
        ('REQUESTED', 'Requested'),
        ('REVIEWED', 'Reviewed by Operations'),
        ('ASSIGNED', 'Assigned to Doctor'),
        ('CONFIRMED', 'Confirmed'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('BILLED', 'Billed'),
        ('CLOSED', 'Closed'),
        ('CANCELLED', 'Cancelled'),
        ('RESCHEDULED', 'Rescheduled'),
    ]
    
    TYPE_CHOICES = [
        ('OPD', 'OPD'),
        ('TELE_CONSULT', 'Tele-consultation'),
        ('EMERGENCY', 'Emergency'),
        ('LAB_TEST', 'Lab Test'),
        ('FOLLOW_UP', 'Follow-up'),
        ('HOME_VISIT', 'Home Visit'),
    ]
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='appointments')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='appointments')
    
    appointment_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='OPD')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='REQUESTED')
    
    reason = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High'), ('URGENT', 'Urgent')], default='MEDIUM')
    
    # Operations Manager fields
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='reviewed_appointments',
                                    limit_choices_to={'role': 'OPERATIONS_MANAGER'})
    reviewed_at = models.DateTimeField(null=True, blank=True)
    operations_notes = models.TextField(blank=True)
    
    # Financial
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    platform_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Walk-in support
    is_walk_in = models.BooleanField(default=False)
    
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'appointments'
        indexes = [
            models.Index(fields=['patient', 'status']),
            models.Index(fields=['hospital', 'appointment_date', 'appointment_time']),
            models.Index(fields=['doctor', 'appointment_date', 'appointment_time']),
            models.Index(fields=['status', 'appointment_date']),
            models.Index(fields=['reviewed_by', 'status']),
        ]
        ordering = ['-appointment_date', '-appointment_time']
    
    def __str__(self):
        return f"{self.patient.user.full_name} - {self.hospital.name} - {self.appointment_date}"
    
    def save(self, *args, **kwargs):
        if not self.consultation_fee and self.doctor:
            self.consultation_fee = self.doctor.consultation_fee
        if self.consultation_fee and self.hospital:
            # Calculate platform commission
            self.platform_commission = (self.consultation_fee * self.hospital.commission_rate) / 100
        super().save(*args, **kwargs)


class AppointmentQueue(models.Model):
    """Queue management for OPD and Emergency"""
    QUEUE_TYPE_CHOICES = [
        ('OPD', 'OPD'),
        ('EMERGENCY', 'Emergency'),
    ]
    
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='queues')
    queue_type = models.CharField(max_length=20, choices=QUEUE_TYPE_CHOICES)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='queue_entries')
    queue_number = models.IntegerField()
    estimated_wait_time = models.IntegerField(default=0)  # in minutes
    called_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'appointment_queues'
        indexes = [
            models.Index(fields=['hospital', 'queue_type', 'queue_number']),
        ]
    
    def __str__(self):
        return f"{self.hospital.name} - {self.queue_type} - #{self.queue_number}"
