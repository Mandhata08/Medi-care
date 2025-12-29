from django.contrib import admin
from .models import Pharmacy, PharmacyMedicine, PharmacyOrder, PharmacyOrderItem, Invoice


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    list_display = ['name', 'admin', 'city', 'is_active', 'is_approved', 'created_at']
    list_filter = ['is_active', 'is_approved', 'city', 'created_at']
    search_fields = ['name', 'admin__email', 'city', 'license_number']
    readonly_fields = ['created_at']


@admin.register(PharmacyMedicine)
class PharmacyMedicineAdmin(admin.ModelAdmin):
    list_display = ['pharmacy', 'medicine', 'stock_quantity', 'price_per_unit', 'is_available']
    list_filter = ['is_available', 'pharmacy', 'updated_at']
    search_fields = ['medicine__name', 'pharmacy__name']


@admin.register(PharmacyOrder)
class PharmacyOrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'prescription', 'pharmacy', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'pharmacy', 'created_at']
    search_fields = ['prescription__patient__user__email', 'pharmacy__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PharmacyOrderItem)
class PharmacyOrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'prescription_medicine', 'quantity', 'unit_price', 'total_price']
    list_filter = ['order__status']
    search_fields = ['prescription_medicine__medicine__name', 'order__prescription__patient__user__email']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'order', 'invoice_date', 'total_amount']
    list_filter = ['invoice_date']
    search_fields = ['invoice_number', 'order__prescription__patient__user__email']

