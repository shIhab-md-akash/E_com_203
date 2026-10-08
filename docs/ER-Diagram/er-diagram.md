# ApexStore - MySQL 8 Entity Relationship Diagram (ERD)

This document describes the relational database structure implemented for the **ApexStore Mini E-Commerce & Order Management Platform** using **MySQL 8 (InnoDB storage engine)**.

---

## 1. Relational Database Schema Overview

The database uses the `InnoDB` storage engine to guarantee full **ACID transactions**, row-level locking (`SELECT ... FOR UPDATE`), and foreign-key referential integrity.

```text
[ users_user ] (Custom User with Role: ADMIN / CUSTOMER)
     │
     ├───(1:N)────> [ users_address ]
     │
     ├───(1:1)────> [ cart_cart ] ────(1:N)────> [ cart_cartitem ]
     │                                                   │
     │                                                   v
     ├───(1:1)────> [ wishlist_wishlist ] ─(1:N)─> [ wishlist_wishlistitem ]
     │                                                   │
     │                                                   v
     ├───(1:N)────> [ orders_order ]             [ products_product ]
     │                    │                              ▲
     │                    ├───(1:N)──> [ orders_orderitem ] ─────┤
     │                    │                              │
     │                    └───(1:1)──> [ payments_payment ]      │
     │                                                   │
     └───(1:N)────> [ coupons_couponusage ]              │
                          ▲                              │
                          │                              │
                   [ coupons_coupon ]                    │
                                                         │
                   [ categories_category ] <──(N:1)──────┤
                                                         │
                   [ inventory_inventorylog ] <──(N:1)───┘
```

---

## 2. Table Definitions & Constraints

### 2.1 `users_user`
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `username`: VARCHAR(150) UNIQUE NOT NULL (Indexed)
- `email`: VARCHAR(254) UNIQUE NOT NULL (Indexed)
- `password`: VARCHAR(128) NOT NULL (PBKDF2 SHA-256)
- `role`: VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER' (`ADMIN`, `CUSTOMER`)
- `first_name`: VARCHAR(150)
- `last_name`: VARCHAR(150)
- `phone`: VARCHAR(20)
- `created_at`: DATETIME(6) NOT NULL

### 2.2 `users_address`
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `user_id`: BIGINT NOT NULL (FK `users_user.id` ON DELETE CASCADE)
- `full_name`: VARCHAR(150) NOT NULL
- `phone`: VARCHAR(20) NOT NULL
- `street_address`: TEXT NOT NULL
- `city`: VARCHAR(100) NOT NULL
- `district`: VARCHAR(100) NOT NULL
- `postal_code`: VARCHAR(20) NOT NULL
- `country`: VARCHAR(100) NOT NULL
- `is_default`: BOOLEAN NOT NULL DEFAULT 0

### 2.3 `categories_category`
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(100) NOT NULL
- `slug`: VARCHAR(120) UNIQUE NOT NULL (Indexed)
- `description`: TEXT NOT NULL
- `image`: VARCHAR(500)
- `status`: VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' (`ACTIVE`, `INACTIVE`)
- `created_at`: DATETIME(6) NOT NULL

### 2.4 `products_product`
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `category_id`: BIGINT NOT NULL (FK `categories_category.id` ON DELETE CASCADE)
- `name`: VARCHAR(255) NOT NULL (Indexed)
- `slug`: VARCHAR(255) UNIQUE NOT NULL (Indexed)
- `description`: TEXT NOT NULL
- `price`: DECIMAL(10,2) NOT NULL
- `discount_price`: DECIMAL(10,2) NULL
- `sku`: VARCHAR(50) UNIQUE NOT NULL (Indexed)
- `stock_quantity`: INT UNSIGNED NOT NULL DEFAULT 0
- `brand`: VARCHAR(100) NOT NULL (Indexed)
- `product_image`: VARCHAR(500) NOT NULL
- `additional_images`: JSON NOT NULL
- `status`: VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' (`ACTIVE`, `INACTIVE`, `OUT_OF_STOCK`)
- `created_at`: DATETIME(6) NOT NULL (Indexed)

### 2.5 `inventory_inventorylog`
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `product_id`: BIGINT NOT NULL (FK `products_product.id` ON DELETE CASCADE)
- `change_amount`: INT NOT NULL (Negative for sales, positive for restocks)
- `reason`: VARCHAR(30) NOT NULL (`PURCHASE`, `RESTOCK`, `RETURN`, `CANCELLATION`, `ADJUSTMENT`)
- `previous_stock`: INT NOT NULL
- `new_stock`: INT NOT NULL
- `reference_id`: VARCHAR(100)
- `note`: TEXT
- `created_at`: DATETIME(6) NOT NULL (Indexed)

### 2.6 `cart_cart` & `cart_cartitem`
- `cart_cart`:
  - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
  - `user_id`: BIGINT UNIQUE NOT NULL (FK `users_user.id` ON DELETE CASCADE)
- `cart_cartitem`:
  - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
  - `cart_id`: BIGINT NOT NULL (FK `cart_cart.id` ON DELETE CASCADE)
  - `product_id`: BIGINT NOT NULL (FK `products_product.id` ON DELETE CASCADE)
  - `quantity`: INT UNSIGNED NOT NULL DEFAULT 1
  - **Constraint:** `UNIQUE KEY (cart_id, product_id)`

### 2.7 `wishlist_wishlist` & `wishlist_wishlistitem`
- `wishlist_wishlist`:
  - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
  - `user_id`: BIGINT UNIQUE NOT NULL (FK `users_user.id` ON DELETE CASCADE)
- `wishlist_wishlistitem`:
  - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
  - `wishlist_id`: BIGINT NOT NULL (FK `wishlist_wishlist.id` ON DELETE CASCADE)
  - `product_id`: BIGINT NOT NULL (FK `products_product.id` ON DELETE CASCADE)
  - **Constraint:** `UNIQUE KEY (wishlist_id, product_id)`

### 2.8 `coupons_coupon` & `coupons_couponusage`
- `coupons_coupon`:
  - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
  - `code`: VARCHAR(50) UNIQUE NOT NULL (Indexed)
  - `discount_type`: VARCHAR(20) NOT NULL (`PERCENTAGE`, `FIXED_AMOUNT`)
  - `discount_value`: DECIMAL(10,2) NOT NULL
  - `min_order_amount`: DECIMAL(10,2) NOT NULL DEFAULT 0.00
  - `max_discount`: DECIMAL(10,2) NULL
  - `start_date`: DATETIME(6) NOT NULL
  - `expiration_date`: DATETIME(6) NOT NULL (Indexed)
  - `usage_limit`: INT UNSIGNED NULL
  - `per_user_usage_limit`: INT UNSIGNED NOT NULL DEFAULT 1
  - `is_active`: BOOLEAN NOT NULL DEFAULT 1
- `coupons_couponusage`:
  - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
  - `coupon_id`: BIGINT NOT NULL (FK `coupons_coupon.id` ON DELETE CASCADE)
  - `user_id`: BIGINT NOT NULL (FK `users_user.id` ON DELETE CASCADE)
  - `order_number`: VARCHAR(50) NOT NULL
  - `used_at`: DATETIME(6) NOT NULL

### 2.9 `orders_order` & `orders_orderitem`
- `orders_order`:
  - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
  - `customer_id`: BIGINT NOT NULL (FK `users_user.id` ON DELETE CASCADE)
  - `order_number`: VARCHAR(50) UNIQUE NOT NULL (Indexed)
  - `subtotal`: DECIMAL(10,2) NOT NULL
  - `discount`: DECIMAL(10,2) NOT NULL DEFAULT 0.00
  - `shipping_fee`: DECIMAL(10,2) NOT NULL DEFAULT 0.00
  - `total_amount`: DECIMAL(10,2) NOT NULL
  - `coupon_id`: BIGINT NULL (FK `coupons_coupon.id` ON DELETE SET NULL)
  - `order_status`: VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
  - `payment_status`: VARCHAR(20) NOT NULL DEFAULT 'PAID' (`PENDING`, `PAID`, `FAILED`, `REFUNDED`)
  - `shipping_full_name`: VARCHAR(150) NOT NULL
  - `shipping_phone`: VARCHAR(20) NOT NULL
  - `shipping_address`: TEXT NOT NULL
  - `shipping_city`: VARCHAR(100) NOT NULL
  - `shipping_postal_code`: VARCHAR(20) NOT NULL
  - `shipping_country`: VARCHAR(100) NOT NULL
  - `created_at`: DATETIME(6) NOT NULL (Indexed)
- `orders_orderitem`:
  - `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
  - `order_id`: BIGINT NOT NULL (FK `orders_order.id` ON DELETE CASCADE)
  - `product_id`: BIGINT NOT NULL (FK `products_product.id` ON DELETE PROTECT)
  - `product_name`: VARCHAR(255) NOT NULL
  - `product_sku`: VARCHAR(50) NOT NULL
  - `unit_price`: DECIMAL(10,2) NOT NULL
  - `quantity`: INT UNSIGNED NOT NULL
  - `subtotal`: DECIMAL(10,2) NOT NULL

### 2.10 `payments_payment`
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `order_id`: BIGINT UNIQUE NOT NULL (FK `orders_order.id` ON DELETE CASCADE)
- `transaction_id`: VARCHAR(100) UNIQUE NOT NULL (Indexed)
- `payment_method`: VARCHAR(30) NOT NULL (`CARD`, `MOBILE_BANKING`, `CASH_ON_DELIVERY`)
- `amount`: DECIMAL(10,2) NOT NULL
- `status`: VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' (`SUCCESS`, `FAILED`)
- `payment_details`: JSON NOT NULL
- `created_at`: DATETIME(6) NOT NULL
