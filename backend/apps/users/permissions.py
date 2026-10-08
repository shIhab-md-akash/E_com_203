from rest_framework import permissions

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to authenticated users with ADMIN role or staff/superuser.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'ADMIN' or request.user.is_staff or request.user.is_superuser)
        )

class IsCustomerUserRole(permissions.BasePermission):
    """
    Allows access to authenticated customers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
