from django.urls import path
from .views import (
    CheckoutAndCreateOrderView,
    OrderListView,
    OrderDetailView,
    OrderTrackView,
    OrderStatusUpdateView,
    OrderCancelCustomerView,
    AdminDashboardStatsView
)

urlpatterns = [
    path('', OrderListView.as_view(), name='order_list'),
    path('checkout/', CheckoutAndCreateOrderView.as_view(), name='order_checkout'),
    path('<int:id>/', OrderDetailView.as_view(), name='order_detail'),
    path('track/<str:order_number>/', OrderTrackView.as_view(), name='order_track'),
    path('<int:id>/status/', OrderStatusUpdateView.as_view(), name='order_status_update'),
    path('<int:id>/cancel/', OrderCancelCustomerView.as_view(), name='order_cancel'),
    path('admin/dashboard-stats/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
]
