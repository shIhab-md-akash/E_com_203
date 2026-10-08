from django.db import models
from django.utils.text import slugify

class Product(models.Model):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        INACTIVE = 'INACTIVE', 'Inactive'
        OUT_OF_STOCK = 'OUT_OF_STOCK', 'Out of Stock'

    name = models.CharField(max_length=255, db_index=True)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.TextField()
    category = models.ForeignKey(
        'categories.Category',
        related_name='products',
        on_delete=models.CASCADE,
        db_index=True
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    sku = models.CharField(max_length=50, unique=True, db_index=True)
    stock_quantity = models.PositiveIntegerField(default=0)
    product_image = models.URLField(max_length=500)
    additional_images = models.JSONField(default=list, blank=True)
    brand = models.CharField(max_length=100, db_index=True, blank=True, default='')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        if self.stock_quantity == 0 and self.status == self.Status.ACTIVE:
            self.status = self.Status.OUT_OF_STOCK
        elif self.stock_quantity > 0 and self.status == self.Status.OUT_OF_STOCK:
            self.status = self.Status.ACTIVE

        super().save(*args, **kwargs)

    @property
    def current_price(self):
        return self.discount_price if self.discount_price and self.discount_price > 0 else self.price

    def __str__(self):
        return f"{self.name} ({self.sku})"
