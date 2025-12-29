from django.contrib import admin
from .models import Hospital, Doctor, DoctorApplication, OPDSchedule


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ['name', 'admin', 'city', 'is_active', 'is_approved', 'created_at']
    list_filter = ['is_active', 'is_approved', 'city', 'state', 'created_at']
    search_fields = ['name', 'admin__email', 'city', 'license_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ['user', 'hospital', 'specialization', 'consultation_fee', 'is_active', 'is_approved']
    list_filter = ['is_active', 'is_approved', 'specialization', 'hospital']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'specialization', 'license_number']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(DoctorApplication)
class DoctorApplicationAdmin(admin.ModelAdmin):
    list_display = ['user', 'hospital', 'specialization', 'status', 'applied_at', 'reviewed_at']
    list_filter = ['status', 'hospital', 'applied_at']
    search_fields = ['user__email', 'user__first_name', 'hospital__name', 'specialization']
    readonly_fields = ['applied_at', 'reviewed_at']


@admin.register(OPDSchedule)
class OPDScheduleAdmin(admin.ModelAdmin):
    list_display = ['doctor', 'day', 'start_time', 'end_time', 'is_active', 'max_appointments']
    list_filter = ['day', 'is_active', 'doctor__hospital']
    search_fields = ['doctor__user__email', 'doctor__user__first_name']

