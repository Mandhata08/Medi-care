from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification"""
    class Meta:
        model = Notification
        fields = ['id', 'user', 'notification_type', 'category', 'title', 'message',
                  'status', 'appointment', 'sent_at', 'delivered_at', 'failure_reason',
                  'metadata', 'created_at']
        read_only_fields = ['id', 'sent_at', 'delivered_at', 'created_at']

