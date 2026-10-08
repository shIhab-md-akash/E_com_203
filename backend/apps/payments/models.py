from django.db import models

class Payment(models.Model):
    class Method(models.TextChoices):
        CARD = 'CARD', 'Credit / Debit Card (Mock)'
        MOBILE_BANKING = 'MOBILE_BANKING', 'Mobile Banking (Mock)'
        CASH_ON_DELIVERY = 'CASH_ON_DELIVERY', 'Cash on Delivery (Mock)'

    class Status(models.TextChoices):
        SUCCESS = 'SUCCESS', 'Success'
        FAILED = 'FAILED', 'Failed'

    order = models.OneToOneField('orders.Order', related_name='payment', on_delete=models.CASCADE)
    transaction_id = models.CharField(max_length=100, unique=True, db_index=True)
    payment_method = models.CharField(max_length=30, choices=Method.choices, default=Method.CARD)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUCCESS, db_index=True)
    payment_details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.transaction_id} - {self.payment_method} - ${self.amount} ({self.status})"
