from rest_framework import serializers
from .models import Product
from apps.categories.serializers import CategorySerializer

class ProductSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    current_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'category_details',
            'price', 'discount_price', 'current_price', 'sku', 'stock_quantity',
            'product_image', 'additional_images', 'brand', 'status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value

    def validate(self, attrs):
        price = attrs.get('price', getattr(self.instance, 'price', None))
        discount_price = attrs.get('discount_price', getattr(self.instance, 'discount_price', None))
        if discount_price is not None and price is not None and discount_price >= price:
            raise serializers.ValidationError({"discount_price": "Discount price must be less than regular price."})
        return attrs
