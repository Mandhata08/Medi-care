from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['user', 'notification_type', 'category', 'title', 'status', 'created_at']
    list_filter = ['notification_type', 'category', 'status', 'created_at']
    search_fields = ['user__email', 'title', 'message']
    readonly_fields = ['created_at', 'sent_at', 'delivered_at']

