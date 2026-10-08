from django.db import models
from django.conf import settings
from decimal import Decimal

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='cart', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username}"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', related_name='cart_items', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('cart', 'product')
        ordering = ['-created_at']

    @property
    def unit_price(self):
        return self.product.current_price

    @property
    def subtotal(self):
        return Decimal(self.unit_price) * self.quantity

    def __str__(self):
        return f"{self.quantity}x {self.product.name} in {self.cart.user.username}'s cart"
