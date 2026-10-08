from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSummarySerializer, CartItemSerializer
from apps.products.models import Product

class CartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSummarySerializer(cart)
        return Response({
            "success": True,
            "data": serializer.data
        })


class CartItemAddView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id:
            return Response({"success": False, "message": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        if quantity <= 0:
            return Response({"success": False, "message": "Quantity must be at least 1"}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id)

        if product.status != Product.Status.ACTIVE:
            return Response({"success": False, "message": "This product is currently unavailable."}, status=status.HTTP_400_BAD_REQUEST)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product, defaults={'quantity': 0})

        new_total_qty = cart_item.quantity + quantity
        if new_total_qty > product.stock_quantity:
            return Response({
                "success": False,
                "message": f"Requested quantity exceeds available stock. Only {product.stock_quantity} available in stock."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = new_total_qty
        cart_item.save()

        summary = CartSummarySerializer(cart)
        return Response({
            "success": True,
            "message": "Product added to cart successfully",
            "data": summary.data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CartItemUpdateDeleteView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item = get_object_or_404(CartItem, id=pk, cart=cart)
        quantity = int(request.data.get('quantity', 1))

        if quantity <= 0:
            cart_item.delete()
            return Response({
                "success": True,
                "message": "Item removed from cart",
                "data": CartSummarySerializer(cart).data
            })

        if quantity > cart_item.product.stock_quantity:
            return Response({
                "success": False,
                "message": f"Only {cart_item.product.stock_quantity} units available in stock."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()

        return Response({
            "success": True,
            "message": "Cart item updated",
            "data": CartSummarySerializer(cart).data
        })

    def delete(self, request, pk):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item = get_object_or_404(CartItem, id=pk, cart=cart)
        cart_item.delete()

        return Response({
            "success": True,
            "message": "Item removed from cart",
            "data": CartSummarySerializer(cart).data
        })


class CartClearView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        return Response({
            "success": True,
            "message": "Cart cleared successfully",
            "data": CartSummarySerializer(cart).data
        })
