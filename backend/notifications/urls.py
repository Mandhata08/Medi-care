from django.urls import path
from .views import NotificationListAPIView, mark_notification_read

urlpatterns = [
    path('', NotificationListAPIView.as_view(), name='notification_list'),
    path('<int:notification_id>/read/', mark_notification_read, name='mark_notification_read'),
]

