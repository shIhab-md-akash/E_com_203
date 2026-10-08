from django.urls import path
from .views import InventoryLogListView

urlpatterns = [
    path('logs/', InventoryLogListView.as_view(), name='inventory_logs_list'),
]
