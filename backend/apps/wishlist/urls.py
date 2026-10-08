from django.urls import path
from .views import WishlistView, WishlistItemDetailView, WishlistMoveToCartView

urlpatterns = [
    path('', WishlistView.as_view(), name='wishlist_view'),
    path('<int:pk>/', WishlistItemDetailView.as_view(), name='wishlist_item_delete'),
    path('<int:pk>/move-to-cart/', WishlistMoveToCartView.as_view(), name='wishlist_move_to_cart'),
]
