from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'payment_type', 'amount', 'payment_method', 'status', 'transaction_id', 'created_at']
    list_filter = ['status', 'payment_type', 'payment_method', 'created_at']
    search_fields = ['user__email', 'transaction_id', 'appointment__patient__user__email']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'

