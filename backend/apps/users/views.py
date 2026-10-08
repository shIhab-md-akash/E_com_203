from rest_framework import generics, status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Address
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    AddressSerializer
)
from .permissions import IsAdminUserRole, IsCustomerUserRole

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "success": True,
            "message": "User registered successfully",
            "data": UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        return Response({
            "success": True,
            "message": "User profile retrieved successfully",
            "data": serializer.data
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "User profile updated successfully",
            "data": serializer.data
        })


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            return Response({"success": True, "message": "Password changed successfully."})
        return Response({"success": False, "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)


class AddressListCreateView(generics.ListCreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user).update(is_default=False)
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        if serializer.validated_data.get('is_default'):
            Address.objects.filter(user=self.request.user).exclude(id=self.get_object().id).update(is_default=False)
        serializer.save()


class CustomerManagementListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return User.objects.all().order_by('-created_at')


class CustomerStatusToggleView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            return Response({
                "success": True,
                "message": f"Customer {'activated' if user.is_active else 'deactivated'} successfully",
                "data": {"id": user.id, "is_active": user.is_active}
            })
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found"}, status=status.HTTP_404_NOT_FOUND)
