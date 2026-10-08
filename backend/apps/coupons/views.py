from rest_framework import generics, views, permissions, status
from rest_framework.response import Response
from decimal import Decimal
from .models import Coupon, CouponUsage
from .serializers import CouponSerializer, ValidateCouponSerializer
from apps.users.permissions import IsAdminUserRole

class CouponListCreateView(generics.ListCreateAPIView):
    serializer_class = CouponSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUserRole()]
        # Authenticated users or admins can list available coupons
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and (getattr(user, 'role', '') == 'ADMIN' or user.is_staff):
            return Coupon.objects.all().order_by('-created_at')
        return Coupon.objects.filter(is_active=True).order_by('-created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "Coupon created successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class CouponDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Coupon.objects.all()
    serializer_class = CouponSerializer
    lookup_field = 'id'

    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return [IsAdminUserRole()]
        return [permissions.AllowAny()]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "Coupon updated successfully",
            "data": serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "Coupon deleted successfully"
        }, status=status.HTTP_200_OK)


class CouponValidateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ValidateCouponSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        code = serializer.validated_data['code'].upper().strip()
        order_amount = Decimal(serializer.validated_data['order_amount'])

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response({
                "success": False,
                "message": f"Coupon code '{code}' does not exist."
            }, status=status.HTTP_404_NOT_FOUND)

        is_valid, reason = coupon.is_valid_now()
        if not is_valid:
            return Response({
                "success": False,
                "message": reason
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check per-user usage limit
        user_usages = CouponUsage.objects.filter(coupon=coupon, user=request.user).count()
        if user_usages >= coupon.per_user_usage_limit:
            return Response({
                "success": False,
                "message": f"You have already used this coupon {user_usages} time(s). Limit is {coupon.per_user_usage_limit}."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Calculate discount
        discount, discount_err = coupon.calculate_discount(order_amount)
        if discount_err:
            return Response({
                "success": False,
                "message": discount_err
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "success": True,
            "message": "Coupon applied successfully!",
            "data": {
                "coupon_id": coupon.id,
                "code": coupon.code,
                "discount_type": coupon.discount_type,
                "discount_value": coupon.discount_value,
                "discount_amount": discount,
                "final_amount": max(Decimal('0.00'), order_amount - discount)
            }
        })
