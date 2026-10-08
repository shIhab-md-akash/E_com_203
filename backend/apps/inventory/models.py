from django.db import models

class InventoryLog(models.Model):
    class Reason(models.TextChoices):
        PURCHASE = 'PURCHASE', 'Customer Purchase'
        RESTOCK = 'RESTOCK', 'Restock / Inbound'
        RETURN = 'RETURN', 'Customer Return'
        CANCELLATION = 'CANCELLATION', 'Order Cancellation'
        ADJUSTMENT = 'ADJUSTMENT', 'Manual Adjustment'

    product = models.ForeignKey('products.Product', related_name='inventory_logs', on_delete=models.CASCADE)
    change_amount = models.IntegerField(help_text="Negative for deductions, positive for increments")
    reason = models.CharField(max_length=30, choices=Reason.choices, default=Reason.RESTOCK)
    previous_stock = models.IntegerField()
    new_stock = models.IntegerField()
    reference_id = models.CharField(max_length=100, blank=True, default='')
    note = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.product.name}: {self.change_amount} ({self.reason}) -> {self.new_stock}"
