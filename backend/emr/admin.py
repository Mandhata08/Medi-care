from django.contrib import admin
from .models import EMRRecord, ClinicalNote, VitalsRecord


@admin.register(EMRRecord)
class EMRRecordAdmin(admin.ModelAdmin):
    list_display = ['patient', 'hospital', 'doctor', 'visit_date', 'diagnosis']
    list_filter = ['visit_date', 'hospital', 'visit_type']
    search_fields = ['patient__user__email', 'doctor__user__email', 'diagnosis']
    readonly_fields = ['visit_date', 'created_at', 'updated_at']


@admin.register(ClinicalNote)
class ClinicalNoteAdmin(admin.ModelAdmin):
    list_display = ['emr_record', 'doctor', 'created_at']
    list_filter = ['created_at']
    search_fields = ['emr_record__patient__user__email', 'doctor__user__email']


@admin.register(VitalsRecord)
class VitalsRecordAdmin(admin.ModelAdmin):
    list_display = ['emr_record', 'recorded_by', 'recorded_at', 'temperature', 'blood_pressure_systolic']
    list_filter = ['recorded_at']
    search_fields = ['emr_record__patient__user__email']

