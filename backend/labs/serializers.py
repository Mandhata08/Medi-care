from rest_framework import serializers
from users.serializers import UserSerializer
from prescriptions.serializers import LabTestRecommendationSerializer
from .models import Lab, LabTest, LabTestRequest, LabReport


class LabSerializer(serializers.ModelSerializer):
    """Serializer for Lab model"""
    admin_email = serializers.EmailField(source='admin.email', read_only=True)
    admin_name = serializers.CharField(source='admin.full_name', read_only=True)
    
    class Meta:
        model = Lab
        fields = ['id', 'name', 'admin', 'admin_email', 'admin_name', 'address', 'city', 
                  'state', 'phone', 'email', 'license_number', 'is_active', 'is_approved', 'created_at']
        read_only_fields = ['id', 'created_at']


class LabTestSerializer(serializers.ModelSerializer):
    """Serializer for LabTest model"""
    class Meta:
        model = LabTest
        fields = ['id', 'name', 'description', 'price', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class LabTestRequestSerializer(serializers.ModelSerializer):
    """Serializer for LabTestRequest"""
    lab = LabSerializer(read_only=True)
    lab_id = serializers.IntegerField(write_only=True, required=False)
    test = LabTestSerializer(read_only=True)
    test_id = serializers.IntegerField(write_only=True, required=False)
    lab_test_recommendation = LabTestRecommendationSerializer(read_only=True)
    lab_test_recommendation_id = serializers.IntegerField(write_only=True)
    lab_name = serializers.CharField(source='lab.name', read_only=True)
    test_name = serializers.CharField(source='lab_test_recommendation.test_name', read_only=True)
    
    class Meta:
        model = LabTestRequest
        fields = ['id', 'lab_test_recommendation', 'lab_test_recommendation_id', 'lab', 'lab_id',
                  'test', 'test_id', 'status', 'lab_name', 'test_name', 'requested_at', 'completed_at']
        read_only_fields = ['id', 'requested_at', 'completed_at']


class LabReportSerializer(serializers.ModelSerializer):
    """Serializer for LabReport"""
    lab_test_request = LabTestRequestSerializer(read_only=True)
    lab_test_request_id = serializers.IntegerField(write_only=True, required=False)
    report_file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = LabReport
        fields = ['id', 'lab_test_request', 'lab_test_request_id', 'report_file', 
                  'report_file_url', 'report_date', 'findings', 'notes', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
    
    def get_report_file_url(self, obj):
        if obj.report_file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.report_file.url)
        return None

