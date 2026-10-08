from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # OpenAPI / Swagger Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # REST APIs
    path('api/auth/', include('apps.users.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path('api/cart/', include('apps.cart.urls')),
    path('api/wishlist/', include('apps.wishlist.urls')),
    path('api/coupons/', include('apps.coupons.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/payments/', include('apps.payments.urls')),
]
