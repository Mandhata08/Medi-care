from django.db import models
from appointments.models import Appointment
from pharmacy.models import PharmacyOrder
from labs.models import LabTestRequest
from users.models import User
from hospitals.models import Hospital


class Payment(models.Model):
    """Payment model with platform commission tracking"""
    PAYMENT_METHOD_CHOICES = [
        ('UPI', 'UPI'),
        ('CARD', 'Card'),
        ('NET_BANKING', 'Net Banking'),
        ('CASH', 'Cash'),
        ('WALLET', 'Wallet'),
    ]
    
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
        ('PARTIALLY_REFUNDED', 'Partially Refunded'),
    ]
    
    PAYMENT_TYPE_CHOICES = [
        ('CONSULTATION', 'Consultation Fee'),
        ('LAB_TEST', 'Lab Test'),
        ('PHARMACY', 'Pharmacy Order'),
        ('BED_CHARGE', 'Bed Charge'),
        ('OT_CHARGE', 'Operation Theater Charge'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payments')
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='payments',
                                  null=True, blank=True)
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Platform commission
    platform_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    hospital_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    
    # Foreign keys to related entities
    appointment = models.ForeignKey(Appointment, on_delete=models.SET_NULL, null=True, blank=True, 
                                    related_name='payments')
    pharmacy_order = models.ForeignKey('pharmacy.PharmacyOrder', on_delete=models.SET_NULL, null=True, blank=True,
                                       related_name='payments')
    lab_test_request = models.ForeignKey('labs.LabTestRequest', on_delete=models.SET_NULL, null=True, blank=True,
                                         related_name='payments')
    
    transaction_id = models.CharField(max_length=200, unique=True, null=True, blank=True)
    payment_gateway_response = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payments'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['hospital', 'status']),
            models.Index(fields=['payment_type', 'status']),
            models.Index(fields=['transaction_id']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Payment #{self.id} - {self.user.email} - ₹{self.amount}"
    
    def save(self, *args, **kwargs):
        if self.hospital and not self.platform_commission:
            # Calculate platform commission
            self.platform_commission = (self.amount * self.hospital.commission_rate) / 100
            self.hospital_amount = self.amount - self.platform_commission
        
        if not self.transaction_id:
            import uuid
            self.transaction_id = f"TXN{self.id or 'NEW'}{uuid.uuid4().hex[:8].upper()}"
        
        super().save(*args, **kwargs)


class Invoice(models.Model):
    """Invoice for payments"""
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_date = models.DateField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    platform_commission = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'payment_invoices'
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['invoice_date']),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"
