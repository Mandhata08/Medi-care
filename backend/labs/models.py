from django.db import models
from prescriptions.models import LabTestRecommendation
from users.models import User


class Lab(models.Model):
    """Lab model"""
    name = models.CharField(max_length=200)
    admin = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lab_admin',
                                 limit_choices_to={'role': 'LAB_ADMIN'})
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    license_number = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'labs'
        indexes = [
            models.Index(fields=['name', 'city']),
            models.Index(fields=['is_active', 'is_approved']),
        ]
    
    def __str__(self):
        return self.name


class LabTest(models.Model):
    """Lab test catalog"""
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lab_tests'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return self.name


class LabTestRequest(models.Model):
    """Lab test request from prescription"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    lab_test_recommendation = models.ForeignKey(LabTestRecommendation, on_delete=models.CASCADE, 
                                                related_name='lab_requests')
    lab = models.ForeignKey(Lab, on_delete=models.CASCADE, related_name='test_requests')
    test = models.ForeignKey(LabTest, on_delete=models.CASCADE, related_name='requests', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'lab_test_requests'
        indexes = [
            models.Index(fields=['lab', 'status']),
            models.Index(fields=['status', 'requested_at']),
        ]
    
    def __str__(self):
        return f"{self.lab_test_recommendation.test_name} - {self.lab.name}"


class LabReport(models.Model):
    """Lab test report"""
    lab_test_request = models.OneToOneField(LabTestRequest, on_delete=models.CASCADE, 
                                            related_name='report')
    report_file = models.FileField(upload_to='lab_reports/')
    report_date = models.DateField()
    findings = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'lab_reports'
        indexes = [
            models.Index(fields=['report_date']),
        ]
    
    def __str__(self):
        return f"Report for {self.lab_test_request}"

