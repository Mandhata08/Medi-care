from django.db import models
from prescriptions.models import Prescription, PrescriptionMedicine
from users.models import User


class Pharmacy(models.Model):
    """Pharmacy model"""
    name = models.CharField(max_length=200)
    admin = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pharmacy_admin',
                                 limit_choices_to={'role': 'PHARMACY_ADMIN'})
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
        db_table = 'pharmacies'
        indexes = [
            models.Index(fields=['name', 'city']),
            models.Index(fields=['is_active', 'is_approved']),
        ]
    
    def __str__(self):
        return self.name


class PharmacyMedicine(models.Model):
    """Medicine inventory in pharmacy"""
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='medicines')
    medicine = models.ForeignKey('prescriptions.Medicine', on_delete=models.CASCADE)
    stock_quantity = models.IntegerField(default=0)
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField(null=True, blank=True)
    is_available = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pharmacy_medicines'
        unique_together = ['pharmacy', 'medicine']
        indexes = [
            models.Index(fields=['pharmacy', 'is_available']),
            models.Index(fields=['medicine', 'is_available']),
        ]
    
    def __str__(self):
        return f"{self.medicine.name} - {self.pharmacy.name}"


class PharmacyOrder(models.Model):
    """Pharmacy order from prescription"""
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('READY', 'Ready for Pickup'),
        ('DISPATCHED', 'Dispatched'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='pharmacy_orders')
    pharmacy = models.ForeignKey(Pharmacy, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pharmacy_orders'
        indexes = [
            models.Index(fields=['pharmacy', 'status']),
            models.Index(fields=['prescription', 'status']),
            models.Index(fields=['status', 'created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order #{self.id} - {self.prescription.patient.user.full_name}"


class PharmacyOrderItem(models.Model):
    """Items in pharmacy order"""
    order = models.ForeignKey(PharmacyOrder, on_delete=models.CASCADE, related_name='items')
    prescription_medicine = models.ForeignKey(PrescriptionMedicine, on_delete=models.CASCADE)
    pharmacy_medicine = models.ForeignKey(PharmacyMedicine, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    class Meta:
        db_table = 'pharmacy_order_items'
        unique_together = ['order', 'prescription_medicine']
    
    def __str__(self):
        return f"{self.prescription_medicine.medicine.name} x{self.quantity} - Order #{self.order.id}"
    
    def save(self, *args, **kwargs):
        self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)


class Invoice(models.Model):
    """Invoice for pharmacy order"""
    order = models.OneToOneField(PharmacyOrder, on_delete=models.CASCADE, related_name='invoice')
    invoice_number = models.CharField(max_length=50, unique=True)
    invoice_date = models.DateField(auto_now_add=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'pharmacy_invoices'
        indexes = [
            models.Index(fields=['invoice_number']),
            models.Index(fields=['invoice_date']),
        ]
    
    def __str__(self):
        return f"Invoice {self.invoice_number}"

