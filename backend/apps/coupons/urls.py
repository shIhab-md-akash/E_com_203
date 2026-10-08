from django.urls import path
from .views import CouponListCreateView, CouponDetailView, CouponValidateView

urlpatterns = [
    path('', CouponListCreateView.as_view(), name='coupon_list_create'),
    path('validate/', CouponValidateView.as_view(), name='coupon_validate'),
    path('<int:id>/', CouponDetailView.as_view(), name='coupon_detail'),
]
