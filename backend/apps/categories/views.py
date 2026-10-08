from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .models import Category
from .serializers import CategorySerializer
from apps.users.permissions import IsAdminUserRole

class CategoryListCreateView(generics.ListCreateAPIView):
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        # Admin can view all; public sees only ACTIVE
        user = self.request.user
        if user.is_authenticated and (getattr(user, 'role', '') == 'ADMIN' or user.is_staff):
            return Category.objects.all().order_by('name')
        return Category.objects.filter(status=Category.Status.ACTIVE).order_by('name')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "Category created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "Category updated successfully",
            "data": serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Category deleted successfully"
        }, status=status.HTTP_200_OK)
