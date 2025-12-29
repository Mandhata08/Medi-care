from django.urls import path
from .views import PaymentListCreateAPIView, PaymentDetailAPIView, process_payment

urlpatterns = [
    path('', PaymentListCreateAPIView.as_view(), name='payment_list_create'),
    path('<int:pk>/', PaymentDetailAPIView.as_view(), name='payment_detail'),
    path('<int:payment_id>/process/', process_payment, name='process_payment'),
]

