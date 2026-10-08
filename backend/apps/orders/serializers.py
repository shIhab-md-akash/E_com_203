from rest_framework import serializers
from .models import Order, OrderItem
from apps.payments.serializers import PaymentSerializer
from apps.coupons.serializers import CouponSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'unit_price', 'quantity', 'subtotal']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payment = PaymentSerializer(read_only=True)
    coupon_details = CouponSerializer(source='coupon', read_only=True)
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer', 'customer_username', 'customer_email',
            'subtotal', 'discount', 'shipping_fee', 'total_amount',
            'coupon', 'coupon_details', 'order_status', 'payment_status',
            'shipping_full_name', 'shipping_phone', 'shipping_address',
            'shipping_city', 'shipping_district', 'shipping_postal_code',
            'shipping_country', 'notes', 'items', 'payment', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'customer', 'subtotal', 'discount', 'shipping_fee',
            'total_amount', 'created_at', 'updated_at'
        ]


class CheckoutRequestSerializer(serializers.Serializer):
    shipping_full_name = serializers.CharField(max_length=150, required=True)
    shipping_phone = serializers.CharField(max_length=20, required=True)
    shipping_address = serializers.CharField(required=True)
    shipping_city = serializers.CharField(max_length=100, required=True)
    shipping_district = serializers.CharField(max_length=100, required=False, default='')
    shipping_postal_code = serializers.CharField(max_length=20, required=True)
    shipping_country = serializers.CharField(max_length=100, default='United States')
    payment_method = serializers.ChoiceField(
        choices=['CARD', 'MOBILE_BANKING', 'CASH_ON_DELIVERY'],
        default='CARD'
    )
    coupon_code = serializers.CharField(max_length=50, required=False, allow_blank=True, default='')
    card_number = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    card_exp = serializers.CharField(max_length=10, required=False, allow_blank=True, default='')
    card_cvv = serializers.CharField(max_length=4, required=False, allow_blank=True, default='')
    mobile_phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    simulate_failure = serializers.BooleanField(required=False, default=False)
