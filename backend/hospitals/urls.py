from django.urls import path
from .views import (
    HospitalListCreateAPIView, HospitalDetailAPIView, hospital_map_discovery,
    DepartmentListCreateAPIView,
    DoctorListCreateAPIView, approve_doctor,
    DoctorApplicationListCreateAPIView, DoctorApplicationDetailAPIView,
    BedListCreateAPIView, OperationTheaterListCreateAPIView, EmergencyCapacityDetailAPIView,
    OPDScheduleListCreateAPIView, OPDScheduleDetailAPIView
)

urlpatterns = [
    path('', HospitalListCreateAPIView.as_view(), name='hospital_list_create'),
    path('map-discovery/', hospital_map_discovery, name='hospital_map_discovery'),
    path('<int:pk>/', HospitalDetailAPIView.as_view(), name='hospital_detail'),
    path('departments/', DepartmentListCreateAPIView.as_view(), name='department_list_create'),
    path('doctors/', DoctorListCreateAPIView.as_view(), name='doctor_list_create'),
    path('doctors/<int:doctor_id>/approve/', approve_doctor, name='approve_doctor'),
    path('doctor-applications/', DoctorApplicationListCreateAPIView.as_view(), name='doctor_application_list_create'),
    path('doctor-applications/<int:pk>/', DoctorApplicationDetailAPIView.as_view(), name='doctor_application_detail'),
    path('beds/', BedListCreateAPIView.as_view(), name='bed_list_create'),
    path('operation-theaters/', OperationTheaterListCreateAPIView.as_view(), name='ot_list_create'),
    path('emergency-capacity/<int:pk>/', EmergencyCapacityDetailAPIView.as_view(), name='emergency_capacity_detail'),
    path('opd-schedules/', OPDScheduleListCreateAPIView.as_view(), name='opd_schedule_list_create'),
    path('opd-schedules/<int:pk>/', OPDScheduleDetailAPIView.as_view(), name='opd_schedule_detail'),
]

