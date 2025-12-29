from rest_framework import permissions


class IsHospitalAdmin(permissions.BasePermission):
    """Permission check for Hospital Admin role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'HOSPITAL_ADMIN'


class IsHospitalDirector(permissions.BasePermission):
    """Permission check for Hospital Director role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'HOSPITAL_DIRECTOR'


class IsOperationsManager(permissions.BasePermission):
    """Permission check for Operations Manager role - CRITICAL ROLE"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'OPERATIONS_MANAGER'


class IsSuperAdmin(permissions.BasePermission):
    """Permission check for Super Admin role"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'SUPER_ADMIN'
