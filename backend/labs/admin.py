from django.contrib import admin
from .models import Lab, LabTest, LabTestRequest, LabReport


@admin.register(Lab)
class LabAdmin(admin.ModelAdmin):
    list_display = ['name', 'admin', 'city', 'is_active', 'is_approved', 'created_at']
    list_filter = ['is_active', 'is_approved', 'city', 'created_at']
    search_fields = ['name', 'admin__email', 'city', 'license_number']
    readonly_fields = ['created_at']


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ['name', 'price', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']


@admin.register(LabTestRequest)
class LabTestRequestAdmin(admin.ModelAdmin):
    list_display = ['lab_test_recommendation', 'lab', 'test', 'status', 'requested_at']
    list_filter = ['status', 'lab', 'requested_at']
    search_fields = ['lab_test_recommendation__test_name', 'lab__name']


@admin.register(LabReport)
class LabReportAdmin(admin.ModelAdmin):
    list_display = ['lab_test_request', 'report_date', 'uploaded_at']
    list_filter = ['report_date', 'uploaded_at']
    search_fields = ['lab_test_request__lab_test_recommendation__test_name']

