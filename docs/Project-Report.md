# Internship Project Report

## Project Title: Mini E-Commerce & Order Management Platform
**Prepared by:** Full-Stack & AI Software Engineering Intern  
**Target Reviewers:** AI / Software Development Engineering Team  
**Database:** MySQL 8.x (InnoDB)  
**Backend:** Python 3.10 / Django 5 / Django REST Framework  
**Frontend:** React 19 / Vite / Tailwind CSS  

---

## 1. Introduction
Modern digital commerce demands zero-compromise data consistency, sub-second latency, and resilience against concurrency phenomena such as overselling and double-spending. This internship project delivers an end-to-end full-stack platform named **ApexStore**, constructed strictly using real relational database models, Django ORM transactions, and an interactive React SPA.

---

## 2. Objectives
1. Implement the complete customer purchase lifecycle: Product Discovery &rarr; Filtering &rarr; Cart &rarr; Coupon Verification &rarr; Checkout &rarr; Mock Payment &rarr; Order Creation &rarr; Stock Decrement &rarr; Order Tracking.
2. Guarantee data consistency under high concurrent load using MySQL 8 InnoDB row locks (`SELECT ... FOR UPDATE`).
3. Enforce Role-Based Access Control (RBAC) separating Customers and Administrators at the API layer.
4. Provide real-time analytics for store managers derived dynamically from SQL queries.
5. Provide automated test verification with a 100% pass rate.

---

## 3. Technology Stack & Architecture
- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Axios, React Router.
- **Backend:** Python 3.10, Django 5.2, Django REST Framework, SimpleJWT, `drf-spectacular` (OpenAPI 3.0).
- **Database:** MySQL 8 / MariaDB (InnoDB Storage Engine with strict foreign keys).
- **Proxy Layer:** Express.js on Port 3000 seamlessly integrating Vite SPA middleware and routing `/api/` to Django on `localhost:8000`.

---

## 4. Relational Database Design
The MySQL database `ecommerce_db` is normalized across 12 core tables:
- `users_user` (Custom User with role: `ADMIN`, `CUSTOMER`)
- `users_address` (Multiple customer shipping addresses)
- `categories_category` (Product categories with slugs)
- `products_product` (Product items with SKUs, stock balances, prices)
- `inventory_inventorylog` (Immutable transaction audit log)
- `cart_cart` & `cart_cartitem` (Shopping cart with unique compound constraints)
- `wishlist_wishlist` & `wishlist_wishlistitem` (Saved favorites)
- `coupons_coupon` & `coupons_couponusage` (Promo discount engine)
- `orders_order` & `orders_orderitem` (Purchase orders with protected FKs)
- `payments_payment` (Mock financial records and transaction IDs)

---

## 5. Concurrency & Inventory Row Locking
To eliminate race conditions when multiple customers purchase the final unit of stock:
```python
with transaction.atomic():
    locked_product = Product.objects.select_for_update().get(id=item.product.id)
    if locked_product.stock_quantity < item.quantity:
        raise ValueError("Insufficient stock")
    locked_product.stock_quantity -= item.quantity
    locked_product.save()
    InventoryLog.objects.create(...)
```
If payment or validation fails, Django issues a database `ROLLBACK`, guaranteeing that stock counts never drop below zero.

---

## 6. Authentication & RBAC
- **Token Format:** JSON Web Token (JWT) using HMAC-SHA256.
- **Tokens Issued:** Short-lived access tokens (1 day) and refresh tokens (7 days).
- **Permissions:** Custom DRF permissions (`IsAdminUserRole`, `IsCustomerUserRole`).
- **Authorization Enforcement:** Protected routes return `403 Forbidden` if a customer attempts to query administrator dashboard or mutation endpoints.

---

## 7. Automated Testing Results
14 automated test scenarios were executed via Django's test runner against the real database engine:
- Authentication & Duplicate registration: **PASSED**
- JWT login & token validation: **PASSED**
- RBAC privilege separation: **PASSED**
- Product filtering, searching, and pagination: **PASSED**
- Cart calculation & stock ceiling checks: **PASSED**
- Coupon eligibility & expiration logic: **PASSED**
- Transactional checkout & stock reduction: **PASSED**
- Rollback upon simulated failure: **PASSED**

---

## 8. Conclusion
The ApexStore platform demonstrates enterprise-grade full-stack architecture, clean separation of concerns, robust transaction handling, and comprehensive API documentation suitable for team review.
