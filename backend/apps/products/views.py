from rest_framework import generics, permissions, status, filters
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from .models import Product
from .serializers import ProductSerializer
from apps.users.permissions import IsAdminUserRole
from apps.inventory.models import InventoryLog

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'success': True,
            'count': self.page.paginator.count,
            'total_pages': self.page.paginator.num_pages,
            'current_page': self.page.number,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class ProductListCreateView(generics.ListCreateAPIView):
    serializer_class = ProductSerializer
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        is_admin = user.is_authenticated and (getattr(user, 'role', '') == 'ADMIN' or user.is_staff)

        queryset = Product.objects.select_related('category').all()
        if not is_admin:
            # Customers only see active or out-of-stock active products
            queryset = queryset.filter(status__in=[Product.Status.ACTIVE, Product.Status.OUT_OF_STOCK])

        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(sku__icontains=search) |
                Q(brand__icontains=search)
            )

        # Category Filter
        category = self.request.query_params.get('category')
        if category:
            if category.isdigit():
                queryset = queryset.filter(category_id=int(category))
            else:
                queryset = queryset.filter(category__slug=category)

        # Price Range Filter
        min_price = self.request.query_params.get('min_price')
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass

        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass

        # In Stock Filter
        in_stock = self.request.query_params.get('in_stock')
        if in_stock in ['true', 'True', '1']:
            queryset = queryset.filter(stock_quantity__gt=0)

        # Sorting
        sort = self.request.query_params.get('sort', 'newest')
        if sort == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort == 'popular':
            queryset = queryset.order_by('-stock_quantity')
        else: # newest
            queryset = queryset.order_by('-created_at')

        return queryset

    def perform_create(self, serializer):
        product = serializer.save()
        if product.stock_quantity > 0:
            InventoryLog.objects.create(
                product=product,
                change_amount=product.stock_quantity,
                reason=InventoryLog.Reason.RESTOCK,
                previous_stock=0,
                new_stock=product.stock_quantity,
                note="Initial inventory added upon product creation"
            )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "Product created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.select_related('category').all()
    serializer_class = ProductSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "data": serializer.data
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        old_stock = instance.stock_quantity
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        updated_product = serializer.save()

        # If stock quantity changed directly via admin edit, record in InventoryLog
        new_stock = updated_product.stock_quantity
        if new_stock != old_stock:
            diff = new_stock - old_stock
            InventoryLog.objects.create(
                product=updated_product,
                change_amount=diff,
                reason=InventoryLog.Reason.RESTOCK if diff > 0 else InventoryLog.Reason.ADJUSTMENT,
                previous_stock=old_stock,
                new_stock=new_stock,
                note="Admin stock adjustment"
            )

        return Response({
            "success": True,
            "message": "Product updated successfully",
            "data": serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Product deleted successfully"
        }, status=status.HTTP_200_OK)
