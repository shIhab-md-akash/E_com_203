import uuid
from decimal import Decimal
from django.db import transaction
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import views, generics, permissions, status
from rest_framework.response import Response

from .models import Order, OrderItem
from .serializers import OrderSerializer, CheckoutRequestSerializer
from apps.products.models import Product
from apps.cart.models import Cart
from apps.inventory.models import InventoryLog
from apps.coupons.models import Coupon, CouponUsage
from apps.payments.models import Payment
from apps.users.permissions import IsAdminUserRole

class CheckoutAndCreateOrderView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CheckoutRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        user = request.user
        cart = Cart.objects.filter(user=user).first()

        if not cart or cart.items.count() == 0:
            return Response({
                "success": False,
                "message": "Cannot checkout with an empty cart."
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_items = list(cart.items.select_related('product').all())

        # Begin atomic transaction with row locking
        try:
            with transaction.atomic():
                # 1. Authoritative calculation & Row Locking on Products
                subtotal = Decimal('0.00')
                locked_products = {}

                for item in cart_items:
                    # SELECT FOR UPDATE prevents race conditions / overselling
                    locked_product = Product.objects.select_for_update().get(id=item.product.id)
                    locked_products[item.product.id] = locked_product

                    if locked_product.status != Product.Status.ACTIVE:
                        raise ValueError(f"Product '{locked_product.name}' is no longer active.")

                    if locked_product.stock_quantity < item.quantity:
                        raise ValueError(
                            f"Insufficient stock for '{locked_product.name}'. "
                            f"Requested: {item.quantity}, Available: {locked_product.stock_quantity}"
                        )

                    unit_price = locked_product.current_price
                    item_subtotal = Decimal(unit_price) * item.quantity
                    subtotal += item_subtotal

                # 2. Coupon Validation & Calculation
                coupon = None
                discount_amount = Decimal('0.00')
                coupon_code = data.get('coupon_code', '').upper().strip()

                if coupon_code:
                    try:
                        coupon = Coupon.objects.select_for_update().get(code=coupon_code)
                        is_valid, reason = coupon.is_valid_now()
                        if not is_valid:
                            raise ValueError(f"Coupon error: {reason}")

                        user_usages = CouponUsage.objects.filter(coupon=coupon, user=user).count()
                        if user_usages >= coupon.per_user_usage_limit:
                            raise ValueError(f"You have reached the usage limit for coupon '{coupon_code}'.")

                        calculated_discount, err = coupon.calculate_discount(subtotal)
                        if err:
                            raise ValueError(f"Coupon error: {err}")
                        discount_amount = calculated_discount

                    except Coupon.DoesNotExist:
                        raise ValueError(f"Coupon '{coupon_code}' does not exist.")

                # 3. Calculate Final Shipping and Grand Total
                shipping_fee = Decimal('0.00') if subtotal >= Decimal('100.00') else Decimal('15.00')
                total_amount = max(Decimal('0.00'), subtotal - discount_amount + shipping_fee)

                # 4. Generate Order Number & Transaction ID
                timestamp_str = timezone.now().strftime("%Y%m%d")
                random_code = uuid.uuid4().hex[:6].upper()
                order_number = f"ORD-{timestamp_str}-{random_code}"
                transaction_id = f"TXN-{timestamp_str}-{random_code}"

                # Mock Payment Processing
                simulate_failure = data.get('simulate_failure', False)
                if simulate_failure:
                    # In case of mock payment failure, rollback transaction
                    raise ValueError("Mock payment declined by processor: Simulated card failure.")

                payment_method = data.get('payment_method', 'CARD')
                order_payment_status = Order.PaymentStatus.PAID if payment_method in ['CARD', 'MOBILE_BANKING'] else Order.PaymentStatus.PENDING

                # 5. Create Order Record
                order = Order.objects.create(
                    customer=user,
                    order_number=order_number,
                    subtotal=subtotal,
                    discount=discount_amount,
                    shipping_fee=shipping_fee,
                    total_amount=total_amount,
                    coupon=coupon,
                    order_status=Order.OrderStatus.CONFIRMED,
                    payment_status=order_payment_status,
                    shipping_full_name=data['shipping_full_name'],
                    shipping_phone=data['shipping_phone'],
                    shipping_address=data['shipping_address'],
                    shipping_city=data['shipping_city'],
                    shipping_district=data.get('shipping_district', ''),
                    shipping_postal_code=data['shipping_postal_code'],
                    shipping_country=data.get('shipping_country', 'United States'),
                )

                # 6. Create Order Items & Decrement Inventory
                for item in cart_items:
                    prod = locked_products[item.product.id]
                    unit_price = prod.current_price
                    item_subtotal = Decimal(unit_price) * item.quantity

                    OrderItem.objects.create(
                        order=order,
                        product=prod,
                        product_name=prod.name,
                        product_sku=prod.sku,
                        unit_price=unit_price,
                        quantity=item.quantity,
                        subtotal=item_subtotal
                    )

                    prev_stock = prod.stock_quantity
                    new_stock = prev_stock - item.quantity
                    prod.stock_quantity = new_stock
                    prod.save()

                    # Record Inventory Audit Log
                    InventoryLog.objects.create(
                        product=prod,
                        change_amount=-item.quantity,
                        reason=InventoryLog.Reason.PURCHASE,
                        previous_stock=prev_stock,
                        new_stock=new_stock,
                        reference_id=order.order_number,
                        note=f"Sold via Order #{order.order_number}"
                    )

                # 7. Record Coupon Usage
                if coupon:
                    CouponUsage.objects.create(
                        coupon=coupon,
                        user=user,
                        order_number=order.order_number
                    )

                # 8. Record Mock Payment
                Payment.objects.create(
                    order=order,
                    transaction_id=transaction_id,
                    payment_method=payment_method,
                    amount=total_amount,
                    status=Payment.Status.SUCCESS,
                    payment_details={
                        "card_last4": data.get('card_number', '')[-4:] if data.get('card_number') else '4242',
                        "provider": "Mock Gateway v1.0",
                        "status_code": "00_APPROVED"
                    }
                )

                # 9. Clear the Shopping Cart
                cart.items.all().delete()

        except ValueError as ex:
            return Response({
                "success": False,
                "message": str(ex)
            }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as ex:
            return Response({
                "success": False,
                "message": f"An unexpected error occurred during checkout: {str(ex)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Serialized Order Response
        serializer = OrderSerializer(order)
        return Response({
            "success": True,
            "message": "Order placed and confirmed successfully!",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'ADMIN' or user.is_staff:
            queryset = Order.objects.select_related('customer', 'payment', 'coupon').prefetch_related('items').all()
        else:
            queryset = Order.objects.select_related('customer', 'payment', 'coupon').prefetch_related('items').filter(customer=user)

        # Filter by status
        order_status = self.request.query_params.get('status')
        if order_status:
            queryset = queryset.filter(order_status=order_status)

        return queryset.order_by('-created_at')


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', '') == 'ADMIN' or user.is_staff:
            return Order.objects.select_related('customer', 'payment', 'coupon').prefetch_related('items').all()
        return Order.objects.select_related('customer', 'payment', 'coupon').prefetch_related('items').filter(customer=user)


class OrderTrackView(views.APIView):
    """
    Public or customer tracking by order_number
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_number):
        try:
            order = Order.objects.select_related('customer', 'payment', 'coupon').prefetch_related('items').get(order_number=order_number)
            serializer = OrderSerializer(order)
            return Response({
                "success": True,
                "data": serializer.data
            })
        except Order.DoesNotExist:
            return Response({
                "success": False,
                "message": f"Order #{order_number} not found."
            }, status=status.HTTP_404_NOT_FOUND)


class OrderStatusUpdateView(views.APIView):
    """
    Admin: Update order status (and handle inventory return if cancelled)
    """
    permission_classes = [IsAdminUserRole]

    def patch(self, request, id):
        order = get_object_or_404(Order, id=id)
        new_status = request.data.get('order_status')
        new_payment_status = request.data.get('payment_status')

        valid_order_statuses = [choice[0] for choice in Order.OrderStatus.choices]
        valid_payment_statuses = [choice[0] for choice in Order.PaymentStatus.choices]

        if new_status and new_status not in valid_order_statuses:
            return Response({"success": False, "message": f"Invalid order status: {new_status}"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            old_status = order.order_status
            if new_status and new_status != old_status:
                order.order_status = new_status

                # If changed to CANCELLED from an active status, restock items!
                if new_status == Order.OrderStatus.CANCELLED and old_status != Order.OrderStatus.CANCELLED:
                    for item in order.items.select_related('product').all():
                        prod = Product.objects.select_for_update().get(id=item.product.id)
                        prev_stock = prod.stock_quantity
                        new_stock = prev_stock + item.quantity
                        prod.stock_quantity = new_stock
                        prod.save()

                        InventoryLog.objects.create(
                            product=prod,
                            change_amount=item.quantity,
                            reason=InventoryLog.Reason.CANCELLATION,
                            previous_stock=prev_stock,
                            new_stock=new_stock,
                            reference_id=order.order_number,
                            note=f"Stock restocked due to order cancellation #{order.order_number}"
                        )

            if new_payment_status and new_payment_status in valid_payment_statuses:
                order.payment_status = new_payment_status
                if hasattr(order, 'payment'):
                    if new_payment_status == Order.PaymentStatus.PAID:
                        order.payment.status = Payment.Status.SUCCESS
                    elif new_payment_status in [Order.PaymentStatus.FAILED, Order.PaymentStatus.REFUNDED]:
                        order.payment.status = Payment.Status.FAILED
                    order.payment.save()

            order.save()

        return Response({
            "success": True,
            "message": "Order status updated successfully",
            "data": OrderSerializer(order).data
        })


class OrderCancelCustomerView(views.APIView):
    """
    Customer cancel order (allowed if status is PENDING or CONFIRMED)
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        order = get_object_or_404(Order, id=id, customer=request.user)

        if order.order_status not in [Order.OrderStatus.PENDING, Order.OrderStatus.CONFIRMED]:
            return Response({
                "success": False,
                "message": f"Order cannot be cancelled in '{order.order_status}' status. Only PENDING or CONFIRMED orders may be cancelled."
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order.order_status = Order.OrderStatus.CANCELLED
            order.payment_status = Order.PaymentStatus.REFUNDED
            order.save()

            # Restock inventory
            for item in order.items.select_related('product').all():
                prod = Product.objects.select_for_update().get(id=item.product.id)
                prev_stock = prod.stock_quantity
                new_stock = prev_stock + item.quantity
                prod.stock_quantity = new_stock
                prod.save()

                InventoryLog.objects.create(
                    product=prod,
                    change_amount=item.quantity,
                    reason=InventoryLog.Reason.CANCELLATION,
                    previous_stock=prev_stock,
                    new_stock=new_stock,
                    reference_id=order.order_number,
                    note=f"Restocked from customer cancellation #{order.order_number}"
                )

        return Response({
            "success": True,
            "message": f"Order #{order.order_number} has been cancelled and refunded.",
            "data": OrderSerializer(order).data
        })


class AdminDashboardStatsView(views.APIView):
    """
    Real-time aggregated analytics calculated from MySQL database.
    """
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        from apps.users.models import User
        from django.db.models import Sum, Count

        total_customers = User.objects.filter(role=User.Role.CUSTOMER).count()
        total_products = Product.objects.count()
        low_stock_products = Product.objects.filter(stock_quantity__lte=5).count()
        active_coupons = Coupon.objects.filter(is_active=True).count()

        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(order_status__in=[Order.OrderStatus.PENDING, Order.OrderStatus.PROCESSING]).count()
        completed_orders = Order.objects.filter(order_status=Order.OrderStatus.DELIVERED).count()

        # Revenue from paid/confirmed orders
        revenue_data = Order.objects.exclude(order_status=Order.OrderStatus.CANCELLED).aggregate(total=Sum('total_amount'))
        total_revenue = float(revenue_data['total'] or 0.00)

        # Orders by status breakdown
        status_counts = Order.objects.values('order_status').annotate(count=Count('id'))
        orders_by_status = {item['order_status']: item['count'] for item in status_counts}

        # Top 5 selling products
        top_items = OrderItem.objects.exclude(order__order_status=Order.OrderStatus.CANCELLED)\
            .values('product__name')\
            .annotate(total_qty=Sum('quantity'), total_sales=Sum('subtotal'))\
            .order_by('-total_qty')[:5]

        top_products = [
            {
                "name": item['product__name'] or 'Product',
                "sold": item['total_qty'],
                "revenue": float(item['total_sales'] or 0)
            }
            for item in top_items
        ]

        # Recent 5 Orders
        recent_orders = Order.objects.select_related('customer').order_by('-created_at')[:5]
        recent_orders_data = [
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer": o.customer.username,
                "total_amount": float(o.total_amount),
                "order_status": o.order_status,
                "created_at": o.created_at
            }
            for o in recent_orders
        ]

        return Response({
            "success": True,
            "data": {
                "total_customers": total_customers,
                "total_products": total_products,
                "total_orders": total_orders,
                "pending_orders": pending_orders,
                "completed_orders": completed_orders,
                "total_revenue": total_revenue,
                "low_stock_products": low_stock_products,
                "active_coupons": active_coupons,
                "orders_by_status": orders_by_status,
                "top_products": top_products,
                "recent_orders": recent_orders_data
            }
        })
