from rest_framework import serializers
from users.serializers import UserSerializer
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Serializer for Payment model"""
    user = UserSerializer(read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = Payment
        fields = ['id', 'user', 'user_email', 'payment_type', 'amount', 'payment_method', 
                  'status', 'appointment', 'pharmacy_order', 'lab_test_request', 
                  'transaction_id', 'payment_gateway_response', 'created_at', 'updated_at']
        read_only_fields = ['id', 'transaction_id', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating payment"""
    class Meta:
        model = Payment
        fields = ['payment_type', 'amount', 'payment_method', 'appointment', 
                  'pharmacy_order', 'lab_test_request']
    
    def validate(self, attrs):
        payment_type = attrs.get('payment_type')
        appointment = attrs.get('appointment')
        pharmacy_order = attrs.get('pharmacy_order')
        lab_test_request = attrs.get('lab_test_request')
        
        # Validate payment type matches the related entity
        if payment_type == 'CONSULTATION' and not appointment:
            raise serializers.ValidationError("Appointment is required for consultation payment")
        if payment_type == 'PHARMACY' and not pharmacy_order:
            raise serializers.ValidationError("Pharmacy order is required for pharmacy payment")
        if payment_type == 'LAB_TEST' and not lab_test_request:
            raise serializers.ValidationError("Lab test request is required for lab test payment")
        
        return attrs

