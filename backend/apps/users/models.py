from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Admin'
        CUSTOMER = 'CUSTOMER', 'Customer'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.CUSTOMER,
        db_index=True
    )
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    REQUIRED_FIELDS = ['email', 'role']

    def is_admin(self):
        return self.role == self.Role.ADMIN or self.is_superuser or self.is_staff

    def __str__(self):
        return f"{self.username} ({self.role})"


class Address(models.Model):
    user = models.ForeignKey(User, related_name='addresses', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    street_address = models.TextField()
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='United States')
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.country}"
