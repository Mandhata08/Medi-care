from django.urls import path
from .views import (
    MedicineListCreateAPIView,
    PrescriptionListCreateAPIView, PrescriptionDetailAPIView,
    patient_prescriptions
)

urlpatterns = [
    path('medicines/', MedicineListCreateAPIView.as_view(), name='medicine_list_create'),
    path('', PrescriptionListCreateAPIView.as_view(), name='prescription_list_create'),
    path('<int:pk>/', PrescriptionDetailAPIView.as_view(), name='prescription_detail'),
    path('patient/my-prescriptions/', patient_prescriptions, name='patient_prescriptions'),
]

