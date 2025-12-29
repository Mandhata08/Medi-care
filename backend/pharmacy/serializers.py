from rest_framework import serializers
from users.serializers import UserSerializer
from prescriptions.serializers import PrescriptionSerializer, PrescriptionMedicineSerializer
from .models import Pharmacy, PharmacyMedicine, PharmacyOrder, PharmacyOrderItem, Invoice


class PharmacySerializer(serializers.ModelSerializer):
    """Serializer for Pharmacy model"""
    admin_email = serializers.EmailField(source='admin.email', read_only=True)
    admin_name = serializers.CharField(source='admin.full_name', read_only=True)
    
    class Meta:
        model = Pharmacy
        fields = ['id', 'name', 'admin', 'admin_email', 'admin_name', 'address', 'city', 
                  'state', 'phone', 'email', 'license_number', 'is_active', 'is_approved', 'created_at']
        read_only_fields = ['id', 'created_at']


class PharmacyMedicineSerializer(serializers.ModelSerializer):
    """Serializer for PharmacyMedicine"""
    medicine_name = serializers.CharField(source='medicine.name', read_only=True)
    medicine_strength = serializers.CharField(source='medicine.strength', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = PharmacyMedicine
        fields = ['id', 'pharmacy', 'pharmacy_name', 'medicine', 'medicine_name', 
                  'medicine_strength', 'stock_quantity', 'price_per_unit', 'expiry_date', 
                  'is_available', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class PharmacyOrderItemSerializer(serializers.ModelSerializer):
    """Serializer for PharmacyOrderItem"""
    prescription_medicine = PrescriptionMedicineSerializer(read_only=True)
    prescription_medicine_id = serializers.IntegerField(write_only=True)
    pharmacy_medicine = PharmacyMedicineSerializer(read_only=True)
    pharmacy_medicine_id = serializers.IntegerField(write_only=True)
    medicine_name = serializers.CharField(source='prescription_medicine.medicine.name', read_only=True)
    
    class Meta:
        model = PharmacyOrderItem
        fields = ['id', 'prescription_medicine', 'prescription_medicine_id', 'pharmacy_medicine', 
                  'pharmacy_medicine_id', 'quantity', 'unit_price', 'total_price', 'medicine_name']
        read_only_fields = ['id', 'total_price']


class PharmacyOrderSerializer(serializers.ModelSerializer):
    """Serializer for PharmacyOrder"""
    prescription = PrescriptionSerializer(read_only=True)
    prescription_id = serializers.IntegerField(write_only=True)
    pharmacy = PharmacySerializer(read_only=True)
    pharmacy_id = serializers.IntegerField(write_only=True, required=False)
    items = PharmacyOrderItemSerializer(many=True, read_only=True)
    patient_name = serializers.CharField(source='prescription.patient.user.full_name', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.name', read_only=True)
    
    class Meta:
        model = PharmacyOrder
        fields = ['id', 'prescription', 'prescription_id', 'pharmacy', 'pharmacy_id', 
                  'status', 'total_amount', 'notes', 'items', 'patient_name', 'pharmacy_name', 
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'total_amount', 'created_at', 'updated_at']


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for Invoice"""
    order = PharmacyOrderSerializer(read_only=True)
    
    class Meta:
        model = Invoice
        fields = ['id', 'order', 'invoice_number', 'invoice_date', 'subtotal', 
                  'tax', 'total_amount', 'created_at']
        read_only_fields = ['id', 'invoice_number', 'invoice_date', 'created_at']

