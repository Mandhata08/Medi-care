from django.db import models
from users.models import User


class Hospital(models.Model):
    """Hospital model for multi-tenant system"""
    name = models.CharField(max_length=200)
    director = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hospital_director',
                                    limit_choices_to={'role': 'HOSPITAL_DIRECTOR'}, null=True, blank=True)
    operations_manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                           related_name='managed_hospitals',
                                           limit_choices_to={'role': 'OPERATIONS_MANAGER'})
    admin = models.OneToOneField(User, on_delete=models.CASCADE, related_name='hospital_admin',
                                 limit_choices_to={'role': 'HOSPITAL_ADMIN'}, null=True, blank=True)
    
    # Location for map-based discovery
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    license_number = models.CharField(max_length=100, unique=True)
    
    # Hospital status
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    opd_open = models.BooleanField(default=False)
    emergency_available = models.BooleanField(default=False)
    
    # Platform settings
    subscription_tier = models.CharField(max_length=50, default='BASIC')
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=5.00)  # Platform commission %
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'hospitals'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['city', 'state']),
            models.Index(fields=['is_active', 'is_approved']),
            models.Index(fields=['opd_open', 'emergency_available']),
        ]
    
    def __str__(self):
        return self.name
    


class Department(models.Model):
    """Hospital departments"""
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='departments')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'departments'
        unique_together = ['hospital', 'name']
        indexes = [
            models.Index(fields=['hospital', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.hospital.name} - {self.name}"


class Doctor(models.Model):
    """Doctor model linked to hospital and department"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile',
                                limit_choices_to={'role': 'DOCTOR'})
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctors')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='doctors')
    specialization = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)
    license_number = models.CharField(max_length=100, unique=True)
    experience_years = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'doctors'
        indexes = [
            models.Index(fields=['hospital', 'is_active']),
            models.Index(fields=['department', 'is_active']),
            models.Index(fields=['specialization']),
            models.Index(fields=['is_approved']),
        ]
    
    def __str__(self):
        return f"Dr. {self.user.full_name} - {self.specialization}"


class Bed(models.Model):
    """Bed management system"""
    BED_TYPE_CHOICES = [
        ('GENERAL', 'General'),
        ('ICU', 'ICU'),
        ('NICU', 'NICU'),
        ('HDU', 'HDU'),
        ('ISOLATION', 'Isolation'),
    ]
    
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=50)
    bed_type = models.CharField(max_length=20, choices=BED_TYPE_CHOICES)
    ward = models.CharField(max_length=100, blank=True)
    is_available = models.BooleanField(default=True)
    is_occupied = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'beds'
        unique_together = ['hospital', 'bed_number']
        indexes = [
            models.Index(fields=['hospital', 'bed_type', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.hospital.name} - {self.bed_number} ({self.bed_type})"


class OperationTheater(models.Model):
    """Operation Theater scheduling"""
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='operation_theaters')
    name = models.CharField(max_length=100)
    ot_number = models.CharField(max_length=50)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'operation_theaters'
        unique_together = ['hospital', 'ot_number']
    
    def __str__(self):
        return f"{self.hospital.name} - {self.name}"


class EmergencyCapacity(models.Model):
    """Emergency department capacity tracking"""
    hospital = models.OneToOneField(Hospital, on_delete=models.CASCADE, related_name='emergency_capacity')
    total_capacity = models.IntegerField(default=0)
    current_occupancy = models.IntegerField(default=0)
    wait_time_minutes = models.IntegerField(default=0)
    ventilators_available = models.IntegerField(default=0)
    ventilators_total = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'emergency_capacity'
    
    def __str__(self):
        return f"{self.hospital.name} - Emergency Capacity"


class DoctorApplication(models.Model):
    """Doctor application to join a hospital"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='doctor_applications',
                             limit_choices_to={'role': 'DOCTOR'})
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctor_applications')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True,
                                   related_name='applications')
    specialization = models.CharField(max_length=100)
    qualification = models.CharField(max_length=200)
    license_number = models.CharField(max_length=100)
    experience_years = models.IntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2)
    bio = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='reviewed_applications')
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'doctor_applications'
        indexes = [
            models.Index(fields=['hospital', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'applied_at']),
        ]
        ordering = ['-applied_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.hospital.name} - {self.status}"


class OPDSchedule(models.Model):
    """OPD Schedule for doctors"""
    DAY_CHOICES = [
        ('MONDAY', 'Monday'),
        ('TUESDAY', 'Tuesday'),
        ('WEDNESDAY', 'Wednesday'),
        ('THURSDAY', 'Thursday'),
        ('FRIDAY', 'Friday'),
        ('SATURDAY', 'Saturday'),
        ('SUNDAY', 'Sunday'),
    ]
    
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='opd_schedules')
    day = models.CharField(max_length=10, choices=DAY_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    max_appointments = models.IntegerField(default=20)
    
    class Meta:
        db_table = 'opd_schedules'
        unique_together = ['doctor', 'day', 'start_time']
        indexes = [
            models.Index(fields=['doctor', 'day']),
        ]
    
    def __str__(self):
        return f"{self.doctor.user.full_name} - {self.day} ({self.start_time} - {self.end_time})"
