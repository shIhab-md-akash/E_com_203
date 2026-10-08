# ApexStore - Mini E-Commerce & Order Management Platform

[![Django](https://img.shields.io/badge/Django-5.2-092E20?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0_InnoDB-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![REST API](https://img.shields.io/badge/Swagger-OpenAPI_3.0-85EA2D?logo=swagger&logoColor=black)](/api/docs/)
[![Tests](https://img.shields.io/badge/Automated_Tests-14%2F14_Passed-brightgreen)](/docs/Test-Cases.md)

A complete, production-grade **Mini E-Commerce & Order Management Platform** built for an **AI / Software Development Team** internship demonstration.

---

## 1. Project Overview

ApexStore covers the full customer purchasing lifecycle with rigorous backend data consistency:

```text
Product Discovery ──> Product Details ──> Wishlist / Cart ──> Coupon Engine ──> Checkout ──> Mock Payment ──> Order Creation ──> MySQL InnoDB Row Lock & Inventory Decrement ──> Real-Time Order Tracking
```

### Core Highlights:
- **Full-Stack Decoupled Architecture:** React 19 SPA communicating with Django 5 REST Framework.
- **MySQL 8 (InnoDB Engine):** Atomic transactions with pessimistic row locking (`select_for_update`) to prevent overselling.
- **Role-Based Access Control (RBAC):** Customer vs Admin privilege separation enforced at the API layer.
- **Audited Inventory Ledger:** Every stock alteration records the timestamp, reference ID, delta, and cause (`PURCHASE`, `RESTOCK`, `CANCELLATION`).
- **Interactive OpenAPI/Swagger Documentation:** Live interactive API explorer at `/api/docs/`.
- **100% Automated Test Suite:** 14 unit and integration test scenarios verifying auth, boundaries, and rollbacks.

---

## 2. Technology Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, Axios, React Router.
- **Backend:** Python 3.10, Django 5.2, Django REST Framework, SimpleJWT, `drf-spectacular`.
- **Database:** MySQL 8 / MariaDB (InnoDB Storage Engine).
- **Reverse Proxy:** Express.js running on Port 3000, serving Vite SPA in development and proxying `/api/` to Django on `localhost:8000`.

---

## 3. Demo Credentials

Quick one-click login buttons are provided on the Sign In page for immediate testing:

| Role | Username | Password | Email | Purpose |
|---|---|---|---|---|
| **Administrator** | `admin` | `AdminPassword123!` | `admin@apexstore.com` | Analytics, Product & Category CRUD, Stock Restock, Orders |
| **Customer 1** | `john_doe` | `CustomerPassword123!` | `customer1@example.com` | Browsing, Cart, Checkout, Order Tracking |
| **Customer 2** | `jane_smith` | `CustomerPassword123!` | `customer2@example.com` | Multi-user test scenarios |

### Active Demo Coupons:
- `WELCOME10`: 10% off orders over $20 (Max discount $50).
- `SAVE20`: 20% off orders over $150 (Max discount $100).
- `FLAT500`: Flat $500 rebate on enterprise orders over $1,000.
- `EXPIRED50`: Expired demo coupon (for boundary and validation testing).

---

## 4. Project Structure

```text
/
├── backend/
│   ├── config/
│   │   ├── __init__.py           # PyMySQL initialization as MySQLdb
│   │   ├── settings.py           # Django & MySQL database configuration
│   │   ├── urls.py               # Master API routing & Swagger endpoints
│   │   ├── asgi.py & wsgi.py
│   ├── apps/
│   │   ├── users/                # Custom User model, RBAC, Addresses, SimpleJWT
│   │   ├── categories/           # Category taxonomy and slug routing
│   │   ├── products/             # Product catalog, search, pagination, seed data
│   │   ├── inventory/            # Inventory audit logs and row locking
│   │   ├── cart/                 # Shopping cart state & quantity calculations
│   │   ├── wishlist/             # Wishlist management and move-to-cart
│   │   ├── coupons/              # Coupon engine, expiration, limits
│   │   ├── orders/               # Atomic checkout transaction and order states
│   │   └── payments/             # Mock payment gateway & transaction IDs
│   ├── tests/                    # Automated DRF test suite
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── src/
│   ├── components/               # Navbar, Footer, ProductCard, Badges
│   ├── context/                  # AuthContext, CartContext, WishlistContext, ToastContext
│   ├── pages/                    # Home, Products, Cart, Checkout, Orders, Profile
│   │   └── admin/                # Admin Dashboard, Products, Inventory, Orders
│   ├── services/                 # Axios client with JWT refresh interceptors
│   ├── types/                    # Full TypeScript schema interfaces
│   ├── App.tsx                   # Master routes configuration
│   └── main.tsx
│
├── docs/
│   ├── ER-Diagram/               # Relational entity diagram documentation
│   ├── Architecture/             # Multi-tier system architecture breakdown
│   ├── API/                      # REST endpoints & OpenAPI 3.0 schema
│   ├── Test-Cases.md             # Formal QA test specification (14 scenarios)
│   └── Project-Report.md         # Comprehensive internship report
│
├── server.ts                     # Fullstack entry point (Express + Django + Vite)
├── package.json
└── README.md
```

---

## 5. MySQL Database & Concurrency Workflow

### Row Locking to Prevent Overselling
When an order is submitted to `POST /api/orders/checkout/`:
```python
with transaction.atomic():
    for item in cart.items:
        # SELECT FOR UPDATE acquires exclusive lock on MySQL row
        product = Product.objects.select_for_update().get(id=item.product.id)
        if product.stock_quantity < item.quantity:
            raise ValueError(f"Insufficient stock for {product.name}")
        product.stock_quantity -= item.quantity
        product.save()
        InventoryLog.objects.create(
            product=product,
            change_amount=-item.quantity,
            reason=InventoryLog.Reason.PURCHASE,
            previous_stock=product.stock_quantity + item.quantity,
            new_stock=product.stock_quantity,
            reference_id=order.order_number
        )
```

If payment fails or simulation mode is toggled on, Django executes an automatic `ROLLBACK`, guaranteeing zero partial orders and pristine inventory counts.

---

## 6. How to Run & Verify

### Running the Application:
```bash
npm run dev
```
This triggers `tsx server.ts`, which:
1. Verifies the MariaDB/MySQL daemon is responding.
2. Spawns Django REST backend on `127.0.0.1:8000`.
3. Hosts Express with Vite middlewares on `http://0.0.0.0:3000`.
4. Proxies `/api/`, `/admin/`, and `/static/` seamlessly.

### Running Automated Tests:
```bash
PYTHONPATH=backend python3 backend/manage.py test tests
```

### Seeding Demo Data:
```bash
PYTHONPATH=backend python3 backend/manage.py seed_data
```

---

## 7. API Documentation

Visit `/api/docs/` in the running application to access the live **Swagger UI**, or visit the built-in in-app **Docs & Architecture** tab for the ER Diagram, Architecture Diagram, Test Cases, and Project Report.
