from rest_framework import permissions


class IsSuperAdmin(permissions.BasePermission):
    """Permission check for Super Admin role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'


class IsHospitalAdmin(permissions.BasePermission):
    """Permission check for Hospital Admin role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'HOSPITAL_ADMIN'


class IsDoctor(permissions.BasePermission):
    """Permission check for Doctor role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'DOCTOR'


class IsPatient(permissions.BasePermission):
    """Permission check for Patient role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'PATIENT'


class IsLabAdmin(permissions.BasePermission):
    """Permission check for Lab Admin role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'LAB_ADMIN'


class IsPharmacyAdmin(permissions.BasePermission):
    """Permission check for Pharmacy Admin role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'PHARMACY_ADMIN'


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Permission check for object ownership"""
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user or request.user.role == 'SUPER_ADMIN'

