from django.urls import path
from .views import (
    LabListCreateAPIView, LabDetailAPIView,
    LabTestListCreateAPIView,
    LabTestRequestListCreateAPIView, LabTestRequestDetailAPIView,
    LabReportListCreateAPIView, LabReportDetailAPIView
)

urlpatterns = [
    path('', LabListCreateAPIView.as_view(), name='lab_list_create'),
    path('<int:pk>/', LabDetailAPIView.as_view(), name='lab_detail'),
    path('tests/', LabTestListCreateAPIView.as_view(), name='lab_test_list_create'),
    path('requests/', LabTestRequestListCreateAPIView.as_view(), name='lab_test_request_list_create'),
    path('requests/<int:pk>/', LabTestRequestDetailAPIView.as_view(), name='lab_test_request_detail'),
    path('reports/', LabReportListCreateAPIView.as_view(), name='lab_report_list_create'),
    path('reports/<int:pk>/', LabReportDetailAPIView.as_view(), name='lab_report_detail'),
]

