from rest_framework import serializers
from .models import Wishlist, WishlistItem
from apps.products.serializers import ProductSerializer

class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_id', 'created_at']
        read_only_fields = ['id', 'created_at']


class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(source='items.count', read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'items', 'total_items']
