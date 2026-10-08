from django.test import TestCase, TransactionTestCase
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta

from apps.users.models import User
from apps.categories.models import Category
from apps.products.models import Product
from apps.cart.models import Cart, CartItem
from apps.coupons.models import Coupon
from apps.orders.models import Order
from apps.inventory.models import InventoryLog

class ApexStorePlatformTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Admin user
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admintest@example.com',
            password='TestPassword123!',
            role=User.Role.ADMIN,
            is_staff=True
        )

        # Customer user
        self.customer = User.objects.create_user(
            username='cust_test',
            email='custtest@example.com',
            password='TestPassword123!',
            role=User.Role.CUSTOMER
        )

        # Category & Product
        self.category = Category.objects.create(
            name='Test Electronics',
            slug='test-electronics',
            status=Category.Status.ACTIVE
        )

        self.product = Product.objects.create(
            name='Test Wireless Earbuds',
            slug='test-wireless-earbuds',
            description='Noise cancelling earbuds for test',
            category=self.category,
            price=Decimal('100.00'),
            discount_price=Decimal('80.00'),
            sku='TEST-EAR-001',
            stock_quantity=10,
            product_image='https://example.com/earbuds.jpg',
            brand='TestBrand',
            status=Product.Status.ACTIVE
        )

        # Coupon
        self.coupon = Coupon.objects.create(
            code='TEST10',
            description='10% test coupon',
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal('10.00'),
            min_order_amount=Decimal('50.00'),
            start_date=timezone.now() - timedelta(days=1),
            expiration_date=timezone.now() + timedelta(days=30),
            is_active=True
        )

        self.expired_coupon = Coupon.objects.create(
            code='EXPIRED_TEST',
            description='Expired test coupon',
            discount_type=Coupon.DiscountType.PERCENTAGE,
            discount_value=Decimal('50.00'),
            min_order_amount=Decimal('10.00'),
            start_date=timezone.now() - timedelta(days=30),
            expiration_date=timezone.now() - timedelta(days=1),
            is_active=True
        )

    # 1. AUTHENTICATION TESTS
    def test_user_registration_success(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!',
            'first_name': 'New',
            'last_name': 'User'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(User.objects.filter(username='newuser').count(), 1)

    def test_user_duplicate_registration_fails(self):
        response = self.client.post('/api/auth/register/', {
            'username': 'cust_test',
            'email': 'custtest@example.com',
            'password': 'StrongPassword123!',
            'password_confirm': 'StrongPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_success_and_jwt_tokens(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'cust_test',
            'password': 'TestPassword123!'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'CUSTOMER')

    def test_user_login_invalid_password(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'cust_test',
            'password': 'WrongPassword999!'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # 2. RBAC TESTS
    def test_customer_cannot_access_admin_dashboard(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.get('/api/orders/admin/dashboard-stats/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_admin_dashboard(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/orders/admin/dashboard-stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])

    # 3. PRODUCTS & FILTERING TESTS
    def test_product_list_and_search(self):
        response = self.client.get('/api/products/?search=Earbuds')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    def test_product_filter_by_price(self):
        response = self.client.get('/api/products/?min_price=50&max_price=120')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['count'], 1)

    # 4. CART TESTS & STOCK VALIDATION
    def test_cart_add_and_quantity_calculation(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.post('/api/cart/items/', {
            'product_id': self.product.id,
            'quantity': 2
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        # Subtotal: 2 * 80.00 = 160.00
        self.assertEqual(Decimal(str(response.data['data']['subtotal'])), Decimal('160.00'))

    def test_cart_prevents_exceeding_available_stock(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.post('/api/cart/items/', {
            'product_id': self.product.id,
            'quantity': 999
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("exceeds available stock", response.data['message'])

    # 5. COUPON VALIDATION TESTS
    def test_coupon_validation_success(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.post('/api/coupons/validate/', {
            'code': 'TEST10',
            'order_amount': '100.00'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Decimal(str(response.data['data']['discount_amount'])), Decimal('10.00'))

    def test_coupon_validation_expired_rejected(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.post('/api/coupons/validate/', {
            'code': 'EXPIRED_TEST',
            'order_amount': '100.00'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("expired", response.data['message'].lower())

    # 6. ORDER TRANSACTION & INVENTORY DEDUCTION TESTS
    def test_checkout_transaction_decrements_inventory_atomically(self):
        self.client.force_authenticate(user=self.customer)

        # 1. Add 2 items to cart
        self.client.post('/api/cart/items/', {
            'product_id': self.product.id,
            'quantity': 2
        })

        initial_stock = self.product.stock_quantity

        # 2. Checkout
        checkout_response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Test Customer',
            'shipping_phone': '+1234567890',
            'shipping_address': '123 Test St',
            'shipping_city': 'Tech City',
            'shipping_postal_code': '12345',
            'payment_method': 'CARD',
            'coupon_code': 'TEST10',
            'card_number': '4242424242424242'
        })

        self.assertEqual(checkout_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(checkout_response.data['success'])

        # 3. Verify stock decremented
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock - 2)

        # 4. Verify inventory audit log created
        log = InventoryLog.objects.filter(product=self.product, change_amount=-2).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.reason, InventoryLog.Reason.PURCHASE)

        # 5. Verify cart is cleared
        cart = Cart.objects.get(user=self.customer)
        self.assertEqual(cart.items.count(), 0)

    def test_checkout_rollback_on_simulated_payment_failure(self):
        self.client.force_authenticate(user=self.customer)

        self.client.post('/api/cart/items/', {
            'product_id': self.product.id,
            'quantity': 2
        })

        initial_stock = self.product.stock_quantity

        # Checkout with simulated failure
        checkout_response = self.client.post('/api/orders/checkout/', {
            'shipping_full_name': 'Test Customer',
            'shipping_phone': '+1234567890',
            'shipping_address': '123 Test St',
            'shipping_city': 'Tech City',
            'shipping_postal_code': '12345',
            'payment_method': 'CARD',
            'simulate_failure': True
        })

        self.assertEqual(checkout_response.status_code, status.HTTP_400_BAD_REQUEST)

        # Inventory must NOT have changed (transaction rolled back!)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock_quantity, initial_stock)
        # Cart must still contain items
        cart = Cart.objects.get(user=self.customer)
        self.assertEqual(cart.items.count(), 1)
