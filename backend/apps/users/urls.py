from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    ProfileView,
    ChangePasswordView,
    AddressListCreateView,
    AddressDetailView,
    CustomerManagementListView,
    CustomerStatusToggleView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='auth_login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='auth_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('addresses/', AddressListCreateView.as_view(), name='user_addresses'),
    path('addresses/<int:pk>/', AddressDetailView.as_view(), name='user_address_detail'),
    path('admin/customers/', CustomerManagementListView.as_view(), name='admin_customers_list'),
    path('admin/customers/<int:pk>/toggle-status/', CustomerStatusToggleView.as_view(), name='admin_customers_toggle'),
]
