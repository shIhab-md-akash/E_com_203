from rest_framework import generics
from .models import InventoryLog
from .serializers import InventoryLogSerializer
from apps.users.permissions import IsAdminUserRole

class InventoryLogListView(generics.ListAPIView):
    serializer_class = InventoryLogSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        queryset = InventoryLog.objects.select_related('product').all()
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset.order_by('-created_at')
