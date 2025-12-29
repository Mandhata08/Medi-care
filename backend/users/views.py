from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, AuditLog
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer, ChangePasswordSerializer
from .permissions import IsSuperAdmin, IsOwnerOrReadOnly


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration endpoint - Only for patients"""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        
        # Log registration
        AuditLog.objects.create(
            user=user,
            action='USER_REGISTERED',
            resource_type='User',
            resource_id=user.id,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_role(request, role):
    """Registration endpoint for specific roles (Doctor, Hospital Admin, Lab Admin, Pharmacy Admin)"""
    allowed_roles = ['DOCTOR', 'HOSPITAL_ADMIN', 'LAB_ADMIN', 'PHARMACY_ADMIN', 'HOSPITAL_DIRECTOR', 'OPERATIONS_MANAGER']
    
    if role not in allowed_roles:
        return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        # Create user with the specified role
        validated_data = serializer.validated_data.copy()
        validated_data.pop('password2')
        validated_data['role'] = role
        user = User.objects.create_user(**validated_data)
        
        refresh = RefreshToken.for_user(user)
        
        # Log registration
        AuditLog.objects.create(
            user=user,
            action='USER_REGISTERED',
            resource_type='User',
            resource_id=user.id,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_super_admin(request):
    """Secret registration endpoint for Super Admin - requires secret key"""
    secret_key = request.data.get('secret_key')
    
    # Secret key validation (change this in production!)
    if secret_key != 'HEALTHCARE_ADMIN_2024_SECRET':
        return Response({'error': 'Invalid secret key'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save(role='SUPER_ADMIN', is_staff=True, is_superuser=True)
        refresh = RefreshToken.for_user(user)
        
        # Log registration
        AuditLog.objects.create(
            user=user,
            action='SUPER_ADMIN_REGISTERED',
            resource_type='User',
            resource_id=user.id,
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    """User login endpoint"""
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        user = authenticate(email=email, password=password)
        if user and user.is_active:
            refresh = RefreshToken.for_user(user)
            
            # Log login
            AuditLog.objects.create(
                user=user,
                action='USER_LOGIN',
                resource_type='User',
                resource_id=user.id,
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def profile(request):
    """Get current user profile"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    """Update current user profile"""
    serializer = UserSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    """Change user password"""
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({'old_password': 'Wrong password.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password updated successfully.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserListAPIView(generics.ListAPIView):
    """List all users (Super Admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
    filterset_fields = ['role', 'is_active']


class UserDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a user"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]
