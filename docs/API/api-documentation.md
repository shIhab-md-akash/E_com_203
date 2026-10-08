# ApexStore REST API Documentation

ApexStore exposes a comprehensive RESTful API built with **Django REST Framework (DRF)** and documented via **OpenAPI 3.0 / Swagger UI**.

- **Interactive Swagger UI:** Accessible directly at `/api/docs/`
- **OpenAPI 3.0 Raw Schema:** Accessible at `/api/schema/`
- **Alternative Redoc Explorer:** Accessible at `/api/redoc/`

---

## 1. Authentication Endpoints

### `POST /api/auth/register/`
Registers a new customer account.
- **Request Body:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "CustomerPassword123!",
    "password_confirm": "CustomerPassword123!",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1 555-0199"
  }
  ```
- **Responses:** `201 Created`, `400 Bad Request`

### `POST /api/auth/login/`
Authenticates user and returns JWT key pair.
- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "AdminPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access": "eyJhbGciOi...",
    "refresh": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@apexstore.com",
      "role": "ADMIN"
    }
  }
  ```

### `POST /api/auth/refresh/`
Refreshes an expired access token using the refresh token.

### `GET /api/auth/profile/` & `PUT /api/auth/profile/`
Retrieve or update customer account profile. Requires `Authorization: Bearer <token>`.

---

## 2. Product Endpoints

### `GET /api/products/`
List products with filtering, search, sorting, and pagination.
- **Query Parameters:**
  - `page`: Page index (default: `1`)
  - `page_size`: Results per page (default: `12`)
  - `search`: Keyword for name, SKU, brand, or description
  - `category`: Category slug or category ID
  - `min_price` & `max_price`: Numeric bounds
  - `in_stock`: `true` to filter items where stock &gt; 0
  - `sort`: `newest`, `price_asc`, `price_desc`, `popular`
- **Response:** `200 OK`

### `GET /api/products/{id}/`
Retrieve product details by ID.

### `POST /api/products/` *(Admin Only)*
Create product in database. Automatically logs initial stock to `InventoryLog`.

### `PUT /api/products/{id}/` & `DELETE /api/products/{id}/` *(Admin Only)*
Update or delete existing product. Stock changes trigger automatic audit log entries.

---

## 3. Shopping Cart Endpoints

### `GET /api/cart/`
Retrieve customer's active cart with calculated subtotal, shipping fee, and grand total.

### `POST /api/cart/items/`
Add product to cart or increment quantity.
- **Validation:** Enforces requested quantity &le; available stock.

### `PATCH /api/cart/items/{id}/`
Update item quantity.

### `DELETE /api/cart/items/{id}/`
Remove item from cart.

### `DELETE /api/cart/clear/`
Remove all items from user cart.

---

## 4. Coupon Verification

### `POST /api/coupons/validate/`
Authoritative server-side discount evaluation.
- **Request Body:**
  ```json
  {
    "code": "WELCOME10",
    "order_amount": "250.00"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "code": "WELCOME10",
      "discount_type": "PERCENTAGE",
      "discount_amount": 25.00,
      "final_amount": 225.00
    }
  }
  ```

---

## 5. Orders & Checkout (Atomic Transaction)

### `POST /api/orders/checkout/`
Executes full checkout transaction with row locking on MySQL InnoDB.
- **Request Body:**
  ```json
  {
    "shipping_full_name": "Jane Smith",
    "shipping_phone": "+1 555-876-5432",
    "shipping_address": "221B Baker St",
    "shipping_city": "New York",
    "shipping_postal_code": "10001",
    "payment_method": "CARD",
    "coupon_code": "SAVE20",
    "card_number": "4242 •••• •••• 4242",
    "simulate_failure": false
  }
  ```
- **Responses:** `201 Created`, `400 Bad Request`

### `GET /api/orders/`
List customer's orders (or all orders if admin).

### `GET /api/orders/{id}/`
Retrieve specific order details and mock payment receipt.

### `POST /api/orders/{id}/cancel/`
Cancels order (if PENDING/CONFIRMED), triggers full refund, and restocks inventory.

### `PATCH /api/orders/{id}/status/` *(Admin Only)*
Update order status (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`).

---

## 6. Admin Analytics

### `GET /api/orders/admin/dashboard-stats/` *(Admin Only)*
Returns real-time aggregated metrics: Total Revenue, Total Orders, Low Stock Alerts, Top Selling Items, and Recent Purchases.
