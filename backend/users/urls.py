from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    register, register_role, register_super_admin, login, profile, update_profile, change_password,
    UserListAPIView, UserDetailAPIView
)

urlpatterns = [
    path('register/', register, name='register'),
    path('register/<str:role>/', register_role, name='register_role'),
    path('register/admin/secret/', register_super_admin, name='register_super_admin'),
    path('login/', login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', profile, name='profile'),
    path('profile/update/', update_profile, name='update_profile'),
    path('change-password/', change_password, name='change_password'),
    path('users/', UserListAPIView.as_view(), name='user_list'),
    path('users/<int:pk>/', UserDetailAPIView.as_view(), name='user_detail'),
]

