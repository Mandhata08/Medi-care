from django.contrib import admin
from .models import Patient, Appointment


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ['user', 'date_of_birth', 'gender', 'blood_group', 'created_at']
    list_filter = ['gender', 'blood_group', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ['patient', 'doctor', 'hospital', 'appointment_date', 'appointment_time', 'status', 'consultation_fee']
    list_filter = ['status', 'appointment_date', 'hospital', 'doctor']
    search_fields = ['patient__user__email', 'doctor__user__email', 'hospital__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'appointment_date'

