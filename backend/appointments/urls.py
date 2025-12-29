from django.urls import path
from .views import (
    PatientListCreateAPIView, PatientDetailAPIView,
    AppointmentListCreateAPIView, AppointmentDetailAPIView,
    operations_appointments, assign_appointment,
    doctor_appointments, patient_appointments
)

urlpatterns = [
    path('patients/', PatientListCreateAPIView.as_view(), name='patient_list_create'),
    path('patients/<int:pk>/', PatientDetailAPIView.as_view(), name='patient_detail'),
    path('', AppointmentListCreateAPIView.as_view(), name='appointment_list_create'),
    path('<int:pk>/', AppointmentDetailAPIView.as_view(), name='appointment_detail'),
    path('operations/', operations_appointments, name='operations_appointments'),
    path('<int:appointment_id>/assign/', assign_appointment, name='assign_appointment'),
    path('doctor/my-appointments/', doctor_appointments, name='doctor_appointments'),
    path('patient/my-appointments/', patient_appointments, name='patient_appointments'),
]

