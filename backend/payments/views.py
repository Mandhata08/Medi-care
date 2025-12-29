from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer
from users.models import AuditLog


class PaymentListCreateAPIView(generics.ListCreateAPIView):
    """List or create payments"""
    queryset = Payment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentCreateSerializer
        return PaymentSerializer
    
    def get_queryset(self):
        queryset = Payment.objects.select_related('user', 'appointment', 'pharmacy_order', 'lab_test_request')
        
        # Users can only see their own payments
        if self.request.user.role != 'SUPER_ADMIN':
            queryset = queryset.filter(user=self.request.user)
        
        # Filter by status, payment_type
        status_filter = self.request.query_params.get('status', None)
        payment_type_filter = self.request.query_params.get('payment_type', None)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if payment_type_filter:
            queryset = queryset.filter(payment_type=payment_type_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        payment = serializer.save(user=self.request.user)
        
        # Generate transaction ID
        if not payment.transaction_id:
            payment.transaction_id = payment.generate_transaction_id()
            payment.save()
        
        # Log payment creation
        AuditLog.objects.create(
            user=self.request.user,
            action='PAYMENT_INITIATED',
            resource_type='Payment',
            resource_id=payment.id,
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class PaymentDetailAPIView(generics.RetrieveAPIView):
    """Retrieve payment details"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Payment.objects.all()
        
        # Users can only see their own payments
        if self.request.user.role != 'SUPER_ADMIN':
            queryset = queryset.filter(user=self.request.user)
        
        return queryset


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_payment(request, payment_id):
    """Process payment (simulate payment gateway)"""
    try:
        payment = Payment.objects.get(id=payment_id)
        
        # Only user who created payment can process it
        if payment.user != request.user and request.user.role != 'SUPER_ADMIN':
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Simulate payment processing
        # In production, integrate with actual payment gateway (Razorpay, Stripe, etc.)
        payment.status = 'COMPLETED'
        payment.payment_gateway_response = {
            'status': 'success',
            'message': 'Payment processed successfully',
            'gateway': 'simulated'
        }
        payment.save()
        
        # Log payment completion
        AuditLog.objects.create(
            user=request.user,
            action='PAYMENT_COMPLETED',
            resource_type='Payment',
            resource_id=payment.id,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'message': 'Payment processed successfully',
            'transaction_id': payment.transaction_id,
            'status': payment.status
        }, status=status.HTTP_200_OK)
    
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

