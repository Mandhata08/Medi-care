from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum, F
from django.utils import timezone
from .models import Pharmacy, PharmacyMedicine, PharmacyOrder, PharmacyOrderItem, Invoice
from .serializers import (
    PharmacySerializer, PharmacyMedicineSerializer, PharmacyOrderSerializer,
    PharmacyOrderItemSerializer, InvoiceSerializer
)
from users.permissions import IsPharmacyAdmin, IsSuperAdmin
from users.models import AuditLog


class PharmacyListCreateAPIView(generics.ListCreateAPIView):
    """List or create pharmacies"""
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Pharmacy.objects.all()
        
        # Only show active and approved pharmacies to non-admins
        if self.request.user.role not in ['SUPER_ADMIN', 'PHARMACY_ADMIN']:
            queryset = queryset.filter(is_active=True, is_approved=True)
        
        # Filter by city
        city = self.request.query_params.get('city', None)
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        return queryset
    
    def perform_create(self, serializer):
        # Only Super Admin can create pharmacies
        if self.request.user.role != 'SUPER_ADMIN':
            raise permissions.PermissionDenied("Only Super Admin can create pharmacies")
        serializer.save()


class PharmacyDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete pharmacy"""
    queryset = Pharmacy.objects.all()
    serializer_class = PharmacySerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]


class PharmacyMedicineListCreateAPIView(generics.ListCreateAPIView):
    """List or create pharmacy medicines"""
    queryset = PharmacyMedicine.objects.filter(is_available=True)
    serializer_class = PharmacyMedicineSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = PharmacyMedicine.objects.filter(is_available=True)
        
        # Pharmacy Admins can only see medicines from their pharmacy
        if self.request.user.role == 'PHARMACY_ADMIN':
            pharmacy = getattr(self.request.user, 'pharmacy_admin', None)
            if pharmacy:
                queryset = queryset.filter(pharmacy=pharmacy)
            else:
                queryset = queryset.none()
        
        # Filter by pharmacy
        pharmacy_id = self.request.query_params.get('pharmacy', None)
        if pharmacy_id:
            queryset = queryset.filter(pharmacy_id=pharmacy_id)
        
        # Filter by medicine search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(medicine__name__icontains=search)
        
        return queryset
    
    def perform_create(self, serializer):
        # Only Pharmacy Admin can add medicines
        if self.request.user.role == 'PHARMACY_ADMIN':
            pharmacy = getattr(self.request.user, 'pharmacy_admin', None)
            if not pharmacy:
                raise permissions.PermissionDenied("Pharmacy Admin must be associated with a pharmacy")
            serializer.save(pharmacy=pharmacy)
        elif self.request.user.role == 'SUPER_ADMIN':
            serializer.save()
        else:
            raise permissions.PermissionDenied("Only Pharmacy Admin or Super Admin can add medicines")


class PharmacyOrderListCreateAPIView(generics.ListCreateAPIView):
    """List or create pharmacy orders"""
    queryset = PharmacyOrder.objects.all()
    serializer_class = PharmacyOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = PharmacyOrder.objects.select_related('prescription', 'pharmacy')
        
        # Pharmacy Admins can only see orders for their pharmacy
        if self.request.user.role == 'PHARMACY_ADMIN':
            pharmacy = getattr(self.request.user, 'pharmacy_admin', None)
            if pharmacy:
                queryset = queryset.filter(pharmacy=pharmacy)
            else:
                queryset = queryset.none()
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        # Create order from prescription
        prescription_id = serializer.validated_data.get('prescription_id')
        from prescriptions.models import Prescription, PrescriptionMedicine
        
        prescription = Prescription.objects.get(id=prescription_id)
        pharmacy_id = serializer.validated_data.get('pharmacy_id')
        
        order = serializer.save(
            prescription=prescription,
            pharmacy_id=pharmacy_id
        )
        
        # Create order items from prescription medicines
        prescription_medicines = PrescriptionMedicine.objects.filter(prescription=prescription)
        total_amount = 0
        
        for pm in prescription_medicines:
            # Find pharmacy medicine
            pharmacy_medicine = PharmacyMedicine.objects.filter(
                pharmacy_id=pharmacy_id,
                medicine=pm.medicine,
                is_available=True,
                stock_quantity__gte=pm.quantity
            ).first()
            
            if pharmacy_medicine:
                item = PharmacyOrderItem.objects.create(
                    order=order,
                    prescription_medicine=pm,
                    pharmacy_medicine=pharmacy_medicine,
                    quantity=pm.quantity,
                    unit_price=pharmacy_medicine.price_per_unit
                )
                total_amount += item.total_price
        
        order.total_amount = total_amount
        order.save()
        
        # Log order creation
        AuditLog.objects.create(
            user=self.request.user,
            action='PHARMACY_ORDER_CREATED',
            resource_type='PharmacyOrder',
            resource_id=order.id,
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class PharmacyOrderDetailAPIView(generics.RetrieveUpdateAPIView):
    """Retrieve or update pharmacy order"""
    queryset = PharmacyOrder.objects.all()
    serializer_class = PharmacyOrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)
        
        # Only Pharmacy Admin can update order status
        if self.request.user.role != 'PHARMACY_ADMIN':
            raise permissions.PermissionDenied("Only Pharmacy Admin can update orders")
        
        # Check if pharmacy admin owns this pharmacy
        pharmacy = getattr(self.request.user, 'pharmacy_admin', None)
        if not pharmacy or instance.pharmacy != pharmacy:
            raise permissions.PermissionDenied("Can only update orders for your pharmacy")
        
        # If order is completed, create invoice
        if new_status == 'COMPLETED' and old_status != 'COMPLETED':
            # Generate invoice
            import random
            invoice_number = f"INV-{timezone.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}"
            
            invoice = Invoice.objects.create(
                order=instance,
                invoice_number=invoice_number,
                subtotal=instance.total_amount,
                tax=instance.total_amount * 0.18,  # 18% GST
                total_amount=instance.total_amount * 1.18
            )
            
            # Update stock quantities
            for item in instance.items.all():
                item.pharmacy_medicine.stock_quantity -= item.quantity
                item.pharmacy_medicine.save()
        
        serializer.save()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsPharmacyAdmin])
def pharmacy_orders(request):
    """Get orders for logged-in pharmacy admin"""
    pharmacy = getattr(request.user, 'pharmacy_admin', None)
    if not pharmacy:
        return Response({'error': 'Pharmacy profile not found'}, status=status.HTTP_404_NOT_FOUND)
    
    orders = PharmacyOrder.objects.filter(pharmacy=pharmacy).order_by('-created_at')
    serializer = PharmacyOrderSerializer(orders, many=True)
    return Response(serializer.data)

