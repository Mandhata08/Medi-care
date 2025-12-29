from django.contrib import admin
from .models import Medicine, Prescription, PrescriptionMedicine, LabTestRecommendation


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ['name', 'generic_name', 'manufacturer', 'strength', 'is_active']
    list_filter = ['is_active', 'dosage_form', 'created_at']
    search_fields = ['name', 'generic_name', 'manufacturer']


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'patient', 'doctor', 'appointment', 'created_at']
    list_filter = ['created_at', 'doctor']
    search_fields = ['patient__user__email', 'doctor__user__email', 'diagnosis']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PrescriptionMedicine)
class PrescriptionMedicineAdmin(admin.ModelAdmin):
    list_display = ['prescription', 'medicine', 'dosage', 'frequency', 'duration']
    list_filter = ['prescription__created_at']
    search_fields = ['medicine__name', 'prescription__patient__user__email']


@admin.register(LabTestRecommendation)
class LabTestRecommendationAdmin(admin.ModelAdmin):
    list_display = ['test_name', 'prescription', 'is_completed', 'created_at']
    list_filter = ['is_completed', 'created_at']
    search_fields = ['test_name', 'prescription__patient__user__email']

