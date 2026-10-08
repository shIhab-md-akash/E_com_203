from django.db import models
from django.conf import settings

class Wishlist(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, related_name='wishlist', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wishlist of {self.user.username}"


class WishlistItem(models.Model):
    wishlist = models.ForeignKey(Wishlist, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey('products.Product', related_name='wishlist_items', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('wishlist', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name} in wishlist"
