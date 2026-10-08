from rest_framework import serializers
from decimal import Decimal
from .models import Cart, CartItem
from apps.products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'unit_price', 'subtotal', 'created_at']
        read_only_fields = ['id', 'unit_price', 'subtotal', 'created_at']


class CartSummarySerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    estimated_shipping = serializers.SerializerMethodField()
    item_count = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'items', 'subtotal', 'estimated_shipping', 'item_count', 'grand_total', 'updated_at']

    def get_subtotal(self, obj):
        total = sum(item.subtotal for item in obj.items.all())
        return round(Decimal(total), 2)

    def get_estimated_shipping(self, obj):
        subtotal = self.get_subtotal(obj)
        if subtotal == 0:
            return Decimal('0.00')
        # Free shipping over $100, otherwise $15 flat rate
        return Decimal('0.00') if subtotal >= 100 else Decimal('15.00')

    def get_item_count(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_grand_total(self, obj):
        subtotal = self.get_subtotal(obj)
        shipping = self.get_estimated_shipping(obj)
        return round(subtotal + shipping, 2)
