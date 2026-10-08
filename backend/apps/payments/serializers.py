from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'transaction_id', 'payment_method', 'amount', 'status', 'payment_details', 'created_at']
        read_only_fields = ['id', 'created_at']
