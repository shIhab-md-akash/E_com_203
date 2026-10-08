from rest_framework import serializers
from .models import InventoryLog

class InventoryLogSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = InventoryLog
        fields = ['id', 'product', 'product_name', 'product_sku', 'change_amount', 'reason', 'previous_stock', 'new_stock', 'reference_id', 'note', 'created_at']
        read_only_fields = ['id', 'created_at']
