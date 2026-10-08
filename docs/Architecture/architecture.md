# System Architecture Documentation

## 1. Architectural Overview

The **ApexStore Mini E-Commerce Platform** adopts a decoupled multi-tier architecture separating the client SPA, API routing reverse proxy, business logic application server, and relational storage.

```text
+-------------------------------------------------------+
|                 Client Presentation                   |
|       React 19 + Vite + Tailwind CSS + Lucide         |
+---------------------------+---------------------------+
                            |
                     HTTPS / REST API
                            |
                            v
+-------------------------------------------------------+
|             Express Reverse Proxy (Port 3000)         |
|     Vite Middleware (Dev) / Static Dist (Prod)        |
+---------------------------+---------------------------+
                            |
                   TCP Loopback Proxy
                            |
                            v
+-------------------------------------------------------+
|           Django 5 REST Framework (Port 8000)        |
|  JWT Token Authentication (SimpleJWT) + RBAC Layers   |
+---------------------------+---------------------------+
                            |
                Business Logic & Transactions
             (Atomic Checkout, Coupon Engine, Logs)
                            |
                            v
+-------------------------------------------------------+
|                      Django ORM                       |
|           transaction.atomic() + select_for_update    |
+---------------------------+---------------------------+
                            |
                   Native PyMySQL Connection
                            |
                            v
+-------------------------------------------------------+
|                 MySQL 8 (InnoDB Engine)               |
|      Row Locking, Foreign Keys & ACID Guarantees      |
+-------------------------------------------------------+
```

---

## 2. Component Responsibilities

### 2.1 React 19 Frontend
- Single Page Application built on modern Vite.
- Responsive, accessible Tailwind CSS layout.
- State management across Authentication, Shopping Cart, Wishlist, and Toasts.
- Interactive Order Tracking and Admin Analytics.

### 2.2 Express Proxy Layer
- Single port (3000) serving the frontend while proxying `/api/*`, `/admin/*`, and `/static/*` requests to the Django REST server.
- Automatically handles background MariaDB daemon supervision and Django server startup.

### 2.3 Django REST Framework Backend
- RESTful HTTP status code adherence (`200`, `201`, `204`, `400`, `401`, `403`, `404`, `500`).
- Role-Based Access Control (RBAC):
  - `CUSTOMER`: Access to browse products, manage own cart/wishlist/profile, place orders, track orders.
  - `ADMIN`: Access to dashboard analytics, product/category CRUD, coupon creation, inventory audit logs, and customer status toggling.
- Automatic API documentation generation via `drf-spectacular` OpenAPI 3.0.

### 2.4 MySQL 8 Database
- Strict ACID transaction compliance.
- Pessimistic row locking (`SELECT FOR UPDATE`) prevents concurrent overselling.
- Complete referential integrity with cascading deletes where appropriate and protected deletes for historical ordered products.
