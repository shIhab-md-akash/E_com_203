from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer
from apps.products.models import Product
from apps.cart.models import Cart, CartItem

class WishlistView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist)
        return Response({
            "success": True,
            "data": serializer.data
        })

    def post(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({"success": False, "message": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)

        item, created = WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)
        if not created:
            return Response({
                "success": False,
                "message": "Product is already in your wishlist",
                "data": WishlistSerializer(wishlist).data
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "message": "Product added to wishlist",
            "data": WishlistSerializer(wishlist).data
        }, status=status.HTTP_201_CREATED)


class WishlistItemDetailView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, pk):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        # pk can be item ID or product ID
        item = WishlistItem.objects.filter(wishlist=wishlist).filter(id=pk).first()
        if not item:
            item = WishlistItem.objects.filter(wishlist=wishlist).filter(product_id=pk).first()

        if item:
            item.delete()

        return Response({
            "success": True,
            "message": "Item removed from wishlist",
            "data": WishlistSerializer(wishlist).data
        })


class WishlistMoveToCartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        item = get_object_or_404(WishlistItem, id=pk, wishlist=wishlist)
        product = item.product

        if product.stock_quantity < 1:
            return Response({
                "success": False,
                "message": "Cannot move to cart: Product is out of stock"
            }, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, _ = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': 0})
        if cart_item.quantity + 1 > product.stock_quantity:
            return Response({
                "success": False,
                "message": f"Cannot add more to cart. Max available stock is {product.stock_quantity}"
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity += 1
        cart_item.save()
        item.delete()

        return Response({
            "success": True,
            "message": "Moved item to cart",
            "data": WishlistSerializer(wishlist).data
        })
