from django.urls import path
from .views import CartView, CartItemAddView, CartItemUpdateDeleteView, CartClearView

urlpatterns = [
    path('', CartView.as_view(), name='cart_view'),
    path('items/', CartItemAddView.as_view(), name='cart_item_add'),
    path('items/<int:pk>/', CartItemUpdateDeleteView.as_view(), name='cart_item_detail'),
    path('clear/', CartClearView.as_view(), name='cart_clear'),
]
