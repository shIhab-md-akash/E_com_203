from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal

class Coupon(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = 'PERCENTAGE', 'Percentage'
        FIXED_AMOUNT = 'FIXED_AMOUNT', 'Fixed Amount'

    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField(blank=True, default='')
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE
    )
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    max_discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    start_date = models.DateTimeField(default=timezone.now)
    expiration_date = models.DateTimeField(db_index=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True, help_text="Total system usage limit")
    per_user_usage_limit = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    @property
    def total_used(self):
        return self.usages.count()

    def is_valid_now(self):
        now = timezone.now()
        if not self.is_active:
            return False, "This coupon is not active."
        if now < self.start_date:
            return False, "This coupon is not yet valid."
        if now > self.expiration_date:
            return False, "This coupon has expired."
        if self.usage_limit is not None and self.total_used >= self.usage_limit:
            return False, "This coupon has reached its maximum global usage limit."
        return True, "Coupon is valid."

    def calculate_discount(self, order_amount):
        amount = Decimal(order_amount)
        if amount < self.min_order_amount:
            return Decimal('0.00'), f"Minimum order amount of ${self.min_order_amount} required."

        if self.discount_type == self.DiscountType.PERCENTAGE:
            calc = (amount * self.discount_value) / Decimal('100.00')
            if self.max_discount is not None and calc > self.max_discount:
                calc = self.max_discount
        else:
            calc = min(self.discount_value, amount)

        return round(calc, 2), None

    def __str__(self):
        return f"{self.code} ({self.discount_value} {self.discount_type})"


class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, related_name='usages', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='coupon_usages', on_delete=models.CASCADE)
    order_number = models.CharField(max_length=50, blank=True, default='')
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-used_at']

    def __str__(self):
        return f"{self.user.username} used {self.coupon.code}"
