from rest_framework import serializers
from .models import Coupon, CouponUsage

class CouponSerializer(serializers.ModelSerializer):
    total_used = serializers.IntegerField(read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'description', 'discount_type', 'discount_value',
            'min_order_amount', 'max_discount', 'start_date', 'expiration_date',
            'usage_limit', 'per_user_usage_limit', 'is_active', 'total_used',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_used', 'created_at', 'updated_at']

    def validate_code(self, value):
        return value.upper().strip()


class ValidateCouponSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
    order_amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
