from rest_framework import generics, permissions
from .models import Payment
from .serializers import PaymentSerializer
from apps.users.permissions import IsAdminUserRole

class PaymentDetailView(generics.RetrieveAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN' or user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(order__customer=user)
