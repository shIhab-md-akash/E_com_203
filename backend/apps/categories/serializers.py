from rest_framework import serializers
from .models import Category

class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'status', 'products_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
