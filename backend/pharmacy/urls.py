from django.urls import path
from .views import (
    PharmacyListCreateAPIView, PharmacyDetailAPIView,
    PharmacyMedicineListCreateAPIView,
    PharmacyOrderListCreateAPIView, PharmacyOrderDetailAPIView,
    pharmacy_orders
)

urlpatterns = [
    path('', PharmacyListCreateAPIView.as_view(), name='pharmacy_list_create'),
    path('<int:pk>/', PharmacyDetailAPIView.as_view(), name='pharmacy_detail'),
    path('medicines/', PharmacyMedicineListCreateAPIView.as_view(), name='pharmacy_medicine_list_create'),
    path('orders/', PharmacyOrderListCreateAPIView.as_view(), name='pharmacy_order_list_create'),
    path('orders/<int:pk>/', PharmacyOrderDetailAPIView.as_view(), name='pharmacy_order_detail'),
    path('my-orders/', pharmacy_orders, name='pharmacy_orders'),
]

