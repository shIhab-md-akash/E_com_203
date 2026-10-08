from django.urls import path
from .views import PaymentDetailView

urlpatterns = [
    path('<int:id>/', PaymentDetailView.as_view(), name='payment_detail'),
]
