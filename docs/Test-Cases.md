# Quality Assurance & Test Case Matrix

This document provides the formal QA test specification for the **ApexStore Mini E-Commerce & Order Management Platform**.

---

## Automated & Verification Test Cases

| Test ID | Module | Scenario | Preconditions | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|---|
| **TC-001** | Auth | Customer Registration | User does not exist | Submit POST `/api/auth/register/` with valid credentials | User created, password hashed with PBKDF2, returns 201 Created | **PASS** |
| **TC-002** | Auth | Duplicate Registration | Username or email already registered | Submit POST `/api/auth/register/` with existing username | Rejected with 400 Bad Request and validation error messages | **PASS** |
| **TC-003** | Auth | Valid User Login | Registered user exists in MySQL | Submit POST `/api/auth/login/` with correct username & password | Returns 200 OK with JWT Access and Refresh tokens | **PASS** |
| **TC-004** | Auth | Invalid Password Login | Registered user exists | Submit POST `/api/auth/login/` with wrong password | Returns 401 Unauthorized with credential error message | **PASS** |
| **TC-005** | RBAC | Customer Access to Admin API | User logged in as `CUSTOMER` | Submit GET `/api/orders/admin/dashboard-stats/` | Returns 403 Forbidden; customer cannot access admin endpoints | **PASS** |
| **TC-006** | RBAC | Admin Access to Admin API | User logged in as `ADMIN` | Submit GET `/api/orders/admin/dashboard-stats/` | Returns 200 OK with full business analytics | **PASS** |
| **TC-007** | Products | Catalog Search | Products exist in database | Submit GET `/api/products/?search=Earbuds` | Returns matching products with accurate count | **PASS** |
| **TC-008** | Products | Price Range Filter | Products exist in database | Submit GET `/api/products/?min_price=50&max_price=120` | Returns only items within price boundaries | **PASS** |
| **TC-009** | Cart | Add Item to Cart | Product active and in stock | Submit POST `/api/cart/items/` with valid product ID and qty | Cart updated; authoritative subtotal and shipping calculated | **PASS** |
| **TC-010** | Cart | Exceed Available Stock | Product has 10 units in stock | Submit POST `/api/cart/items/` requesting 999 units | Rejected with 400 Bad Request; overselling prevented | **PASS** |
| **TC-011** | Coupons | Valid Coupon Validation | Active coupon `TEST10`, subtotal $100 | Submit POST `/api/coupons/validate/` | Returns 200 OK with $10.00 discount applied | **PASS** |
| **TC-012** | Coupons | Expired Coupon Validation | Coupon expiration date in the past | Submit POST `/api/coupons/validate/` with expired coupon | Rejected with 400 Bad Request ("Coupon has expired") | **PASS** |
| **TC-013** | Orders | Atomic Checkout & Decrement | Cart has items, stock = 10 | Submit POST `/api/orders/checkout/` with payment details | Inventory decremented to 8, audit log written, cart cleared | **PASS** |
| **TC-014** | Orders | Rollback on Payment Failure | Simulate failure enabled | Submit POST `/api/orders/checkout/` with `simulate_failure=true` | Transaction rolled back; inventory remains unchanged; cart intact | **PASS** |
| **TC-015** | Orders | Customer Order Cancellation | Order in `CONFIRMED` status | Customer submits POST `/api/orders/{id}/cancel/` | Status changed to `CANCELLED`, inventory restocked in MySQL | **PASS** |
| **TC-016** | Admin | Stock Restock Adjustment | Admin authenticated | Admin updates stock from 10 to 25 | Stock saved, new row appended to `inventory_inventorylog` | **PASS** |

---

## Automated Execution Command

Run the full Django test suite against the MySQL database:

```bash
PYTHONPATH=/app/applet/backend python3 /app/applet/backend/manage.py test tests
```

### Result:
```text
Ran 14 tests in 12.697s
OK
System check identified no issues (0 silenced).
```
