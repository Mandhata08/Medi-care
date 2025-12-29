from django.urls import path
from .views import (
    EMRRecordListCreateAPIView, EMRRecordDetailAPIView,
    PatientEMRListAPIView, VitalsRecordListCreateAPIView
)

urlpatterns = [
    path('', EMRRecordListCreateAPIView.as_view(), name='emr_list_create'),
    path('<int:pk>/', EMRRecordDetailAPIView.as_view(), name='emr_detail'),
    path('patient/<int:patient_id>/', PatientEMRListAPIView.as_view(), name='patient_emr_list'),
    path('vitals/', VitalsRecordListCreateAPIView.as_view(), name='vitals_list_create'),
]

