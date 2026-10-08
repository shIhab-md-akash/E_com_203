import uuid
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.users.models import User, Address
from apps.categories.models import Category
from apps.products.models import Product
from apps.inventory.models import InventoryLog
from apps.coupons.models import Coupon
from apps.orders.models import Order, OrderItem
from apps.payments.models import Payment

class Command(BaseCommand):
    help = 'Seeds initial users, categories, products, inventory, coupons, and orders.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting database seeding...")

        # 1. Create Users
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@apexstore.com',
                'first_name': 'Apex',
                'last_name': 'Administrator',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('AdminPassword123!')
        admin_user.role = User.Role.ADMIN
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()

        c1, _ = User.objects.get_or_create(
            username='john_doe',
            defaults={
                'email': 'customer1@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'phone': '+1 (555) 234-5678',
                'role': User.Role.CUSTOMER,
            }
        )
        c1.set_password('CustomerPassword123!')
        c1.save()

        c2, _ = User.objects.get_or_create(
            username='jane_smith',
            defaults={
                'email': 'customer2@example.com',
                'first_name': 'Jane',
                'last_name': 'Smith',
                'phone': '+1 (555) 876-5432',
                'role': User.Role.CUSTOMER,
            }
        )
        c2.set_password('CustomerPassword123!')
        c2.save()

        # Addresses
        Address.objects.get_or_create(
            user=c1,
            full_name='John Doe',
            defaults={
                'phone': '+1 (555) 234-5678',
                'street_address': '742 Evergreen Terrace',
                'city': 'Springfield',
                'district': 'Oregon',
                'postal_code': '97477',
                'country': 'United States',
                'is_default': True,
            }
        )

        Address.objects.get_or_create(
            user=c2,
            full_name='Jane Smith',
            defaults={
                'phone': '+1 (555) 876-5432',
                'street_address': '221B Baker Street',
                'city': 'New York',
                'district': 'Manhattan',
                'postal_code': '10001',
                'country': 'United States',
                'is_default': True,
            }
        )

        self.stdout.write(self.style.SUCCESS("Users and addresses seeded."))

        # 2. Categories
        categories_data = [
            {
                "name": "Electronics",
                "slug": "electronics",
                "description": "High-performance tech, premium audio, smartphones, displays, and smart accessories.",
                "image": "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Fashion",
                "slug": "fashion",
                "description": "Contemporary apparel, minimalist streetwear, premium leather, and statement pieces.",
                "image": "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Home & Living",
                "slug": "home-living",
                "description": "Artisan furniture, organic ceramic tableware, ambient lighting, and modern decor.",
                "image": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Books & Stationery",
                "slug": "books-stationery",
                "description": "Curated hardcovers, architecture monographs, journals, and fountain pens.",
                "image": "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80"
            },
            {
                "name": "Sports & Outdoors",
                "slug": "sports-outdoors",
                "description": "Engineered technical gear, trail hydration, smart wearables, and wellness equipment.",
                "image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"
            }
        ]

        cat_objs = {}
        for c in categories_data:
            cat, _ = Category.objects.update_or_create(
                slug=c['slug'],
                defaults={'name': c['name'], 'description': c['description'], 'image': c['image'], 'status': Category.Status.ACTIVE}
            )
            cat_objs[c['slug']] = cat

        self.stdout.write(self.style.SUCCESS("Categories seeded."))

        # 3. Products (24 realistic products)
        products_data = [
            # Electronics
            {
                "name": "Apex Studio Wireless Headphones",
                "slug": "apex-studio-wireless-headphones",
                "category": cat_objs["electronics"],
                "price": Decimal("299.00"),
                "discount_price": Decimal("249.00"),
                "sku": "ELEC-HDPH-001",
                "stock_quantity": 45,
                "brand": "ApexSound",
                "description": "Studio-grade wireless over-ear headphones with hybrid active noise cancellation, custom 40mm beryllium drivers, and 36-hour battery life.",
                "product_image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
                "additional_images": [
                    "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"
                ]
            },
            {
                "name": "Nova 4K OLED Ultra Display 27-inch",
                "slug": "nova-4k-oled-ultra-display",
                "category": cat_objs["electronics"],
                "price": Decimal("799.00"),
                "discount_price": Decimal("699.00"),
                "sku": "ELEC-DISP-002",
                "stock_quantity": 18,
                "brand": "NovaVision",
                "description": "True 10-bit color accuracy, 99% DCI-P3 gamut, 144Hz refresh rate, and Thunderbolt 4 90W single-cable docking.",
                "product_image": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Chronos Precision Mechanical Keyboard",
                "slug": "chronos-precision-mechanical-keyboard",
                "category": cat_objs["electronics"],
                "price": Decimal("189.00"),
                "discount_price": None,
                "sku": "ELEC-KYBD-003",
                "stock_quantity": 30,
                "brand": "Chronos",
                "description": "CNC anodized aluminum body, hot-swappable tactile switches, gasket mounted acoustics, and RGB per-key backlighting.",
                "product_image": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Quantum Core Smart Watch Series 7",
                "slug": "quantum-core-smart-watch-series-7",
                "category": cat_objs["electronics"],
                "price": Decimal("349.00"),
                "discount_price": Decimal("299.00"),
                "sku": "ELEC-WTCH-004",
                "stock_quantity": 25,
                "brand": "Quantum",
                "description": "Titanium case with sapphire crystal, ECG sensor, GPS precision dual-frequency tracking, and 7-day endurance.",
                "product_image": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Vortex Pro Drone 4K Gimbal",
                "slug": "vortex-pro-drone-4k-gimbal",
                "category": cat_objs["electronics"],
                "price": Decimal("899.00"),
                "discount_price": None,
                "sku": "ELEC-DRON-005",
                "stock_quantity": 12,
                "brand": "VortexAero",
                "description": "Compact folding aerial camera drone with 3-axis mechanical gimbal stabilization and 10km HD video transmission.",
                "product_image": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },

            # Fashion
            {
                "name": "Merino Wool Minimalist Crewneck",
                "slug": "merino-wool-minimalist-crewneck",
                "category": cat_objs["fashion"],
                "price": Decimal("120.00"),
                "discount_price": Decimal("95.00"),
                "sku": "FASH-CRWN-001",
                "stock_quantity": 50,
                "brand": "NordicThread",
                "description": "100% extra-fine Italian merino wool sweater offering thermo-regulating comfort and timeless minimalist silhouette.",
                "product_image": "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Handcrafted Vegetable-Tanned Leather Bag",
                "slug": "handcrafted-leather-messenger-bag",
                "category": cat_objs["fashion"],
                "price": Decimal("245.00"),
                "discount_price": None,
                "sku": "FASH-BAG-002",
                "stock_quantity": 15,
                "brand": "Atelier Heritage",
                "description": "Full-grain Tuscan leather messenger bag with solid brass hardware, laptop divider, and water-repellent wax finish.",
                "product_image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Classic Trench Coat Weatherproof",
                "slug": "classic-trench-coat-weatherproof",
                "category": cat_objs["fashion"],
                "price": Decimal("310.00"),
                "discount_price": Decimal("265.00"),
                "sku": "FASH-COAT-003",
                "stock_quantity": 20,
                "brand": "Kensington & Co",
                "description": "Double-breasted weatherproof gabardine trench coat with storm flap, buckled cuffs, and signature horn buttons.",
                "product_image": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Everyday Canvas Low-Top Sneakers",
                "slug": "everyday-canvas-low-top-sneakers",
                "category": cat_objs["fashion"],
                "price": Decimal("85.00"),
                "discount_price": Decimal("68.00"),
                "sku": "FASH-SHOE-004",
                "stock_quantity": 40,
                "brand": "Solestep",
                "description": "Organic cotton canvas sneakers with vulcanized rubber sole and ergonomic memory foam insole for day-long walking.",
                "product_image": "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Polarized Acetate Sunglasses",
                "slug": "polarized-acetate-sunglasses",
                "category": cat_objs["fashion"],
                "price": Decimal("140.00"),
                "discount_price": None,
                "sku": "FASH-SUN-005",
                "stock_quantity": 35,
                "brand": "OpticLine",
                "description": "Hand-polished Italian acetate frames with 100% UV400 polarized nylon lenses and five-barrel German hinges.",
                "product_image": "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },

            # Home & Living
            {
                "name": "Nordic Ceramic Pour-Over Coffee Set",
                "slug": "nordic-ceramic-coffee-set",
                "category": cat_objs["home-living"],
                "price": Decimal("75.00"),
                "discount_price": Decimal("59.00"),
                "sku": "HOME-COFF-001",
                "stock_quantity": 30,
                "brand": "BrewCraft",
                "description": "Matte stoneware dripper and serving carafe engineered with 60-degree spiral ribbing for optimal extraction.",
                "product_image": "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Cast Concrete Minimalist Desk Lamp",
                "slug": "cast-concrete-minimalist-desk-lamp",
                "category": cat_objs["home-living"],
                "price": Decimal("110.00"),
                "discount_price": None,
                "sku": "HOME-LAMP-002",
                "stock_quantity": 22,
                "brand": "Lumina",
                "description": "Solid architectural concrete base with touch-capacitive dimming, brass arm, and warm 2700K diffusion LED.",
                "product_image": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Linen Duvet & Pillowcase Set (Queen)",
                "slug": "linen-duvet-pillowcase-set",
                "category": cat_objs["home-living"],
                "price": Decimal("195.00"),
                "discount_price": Decimal("165.00"),
                "sku": "HOME-BED-003",
                "stock_quantity": 16,
                "brand": "HyggeNest",
                "description": "Pure stonewashed French flax linen bedding set with breathable texture and hidden mother-of-pearl buttons.",
                "product_image": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Handmade Speckled Stoneware Dinner Plate (Set of 4)",
                "slug": "handmade-speckled-stoneware-plates",
                "category": cat_objs["home-living"],
                "price": Decimal("88.00"),
                "discount_price": None,
                "sku": "HOME-PLAT-004",
                "stock_quantity": 25,
                "brand": "Earthware",
                "description": "Artisan wheel-thrown ceramic plates finished with reactive matte glaze and organic raw clay rims.",
                "product_image": "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Ultrasonic Essential Oil Aroma Diffuser",
                "slug": "ultrasonic-essential-oil-diffuser",
                "category": cat_objs["home-living"],
                "price": Decimal("64.00"),
                "discount_price": Decimal("49.00"),
                "sku": "HOME-DIFF-005",
                "stock_quantity": 38,
                "brand": "AuraBreeze",
                "description": "Quiet ceramic ultrasonic mister with ambient breathing light and automatic waterless shutoff.",
                "product_image": "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },

            # Books & Stationery
            {
                "name": "The Architecture of Tomorrow (Collector's Hardcover)",
                "slug": "the-architecture-of-tomorrow-book",
                "category": cat_objs["books-stationery"],
                "price": Decimal("65.00"),
                "discount_price": None,
                "sku": "BOOK-ARCH-001",
                "stock_quantity": 30,
                "brand": "Phaidon Press",
                "description": "A visual journey across 450 pages of world-renowned sustainable and modular architectural marvels.",
                "product_image": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Refillable Full-Grain Leather Journal (A5)",
                "slug": "refillable-leather-journal-a5",
                "category": cat_objs["books-stationery"],
                "price": Decimal("48.00"),
                "discount_price": Decimal("38.00"),
                "sku": "BOOK-JRNL-002",
                "stock_quantity": 40,
                "brand": "Scriptum",
                "description": "Hand-stitched oil-tanned leather cover equipped with 120gsm fountain pen friendly ivory paper inserts.",
                "product_image": "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Solid Brass Weighted Fountain Pen (Fine Nib)",
                "slug": "solid-brass-weighted-fountain-pen",
                "category": cat_objs["books-stationery"],
                "price": Decimal("92.00"),
                "discount_price": None,
                "sku": "BOOK-FPEN-003",
                "stock_quantity": 28,
                "brand": "Kaweco Artisan",
                "description": "Heavy raw brass body that naturally patinas with usage, paired with a precision German iridium point nib.",
                "product_image": "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Design Systems in Practice (Field Guide)",
                "slug": "design-systems-in-practice",
                "category": cat_objs["books-stationery"],
                "price": Decimal("42.00"),
                "discount_price": Decimal("34.00"),
                "sku": "BOOK-DSGN-004",
                "stock_quantity": 50,
                "brand": "Studio Press",
                "description": "Comprehensive guide for engineering and UX design teams architecting atomic tokens and UI components.",
                "product_image": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },

            # Sports & Outdoors
            {
                "name": "Titanium Double-Wall Insulated Bottle (32oz)",
                "slug": "titanium-insulated-bottle-32oz",
                "category": cat_objs["sports-outdoors"],
                "price": Decimal("72.00"),
                "discount_price": Decimal("58.00"),
                "sku": "SPRT-BOTL-001",
                "stock_quantity": 45,
                "brand": "PeakForge",
                "description": "Ultralight grade-1 aerospace titanium thermal flask keeping ice water subzero for 36 hours without metallic taste.",
                "product_image": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Technical All-Terrain Daypack 28L",
                "slug": "technical-all-terrain-daypack-28l",
                "category": cat_objs["sports-outdoors"],
                "price": Decimal("165.00"),
                "discount_price": Decimal("139.00"),
                "sku": "SPRT-PACK-002",
                "stock_quantity": 22,
                "brand": "PeakForge",
                "description": "Waterproof ripstop nylon daypack featuring ventilated mesh harness, hydration port, and modular trekking attachments.",
                "product_image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Natural Cork & Rubber Yoga Mat (5mm)",
                "slug": "natural-cork-rubber-yoga-mat",
                "category": cat_objs["sports-outdoors"],
                "price": Decimal("85.00"),
                "discount_price": None,
                "sku": "SPRT-YOGA-003",
                "stock_quantity": 30,
                "brand": "PranaEarth",
                "description": "Antimicrobial sustainable cork surface backed with non-slip natural tree rubber for superior sweat grip.",
                "product_image": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "GPS Solar Multi-Sport Trail Watch",
                "slug": "gps-solar-multisport-trail-watch",
                "category": cat_objs["sports-outdoors"],
                "price": Decimal("499.00"),
                "discount_price": Decimal("429.00"),
                "sku": "SPRT-GPSW-004",
                "stock_quantity": 14,
                "brand": "ApexSound",
                "description": "Power Glass solar charging lens, topographic trail routing, barometric altimeter, and pulse-oximeter tracking.",
                "product_image": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            },
            {
                "name": "Compact Trail Headlamp (800 Lumens)",
                "slug": "compact-trail-headlamp-800-lumens",
                "category": cat_objs["sports-outdoors"],
                "price": Decimal("55.00"),
                "discount_price": None,
                "sku": "SPRT-LAMP-005",
                "stock_quantity": 3, # Low stock demo!
                "brand": "BeamTrail",
                "description": "IP68 waterproof rechargeable headlamp with reactive lighting sensors and 120-meter focused spotlight.",
                "product_image": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
                "additional_images": []
            }
        ]

        for p_data in products_data:
            prod, created = Product.objects.update_or_create(
                slug=p_data['slug'],
                defaults=p_data
            )
            # Create inventory log if created
            if created or not prod.inventory_logs.exists():
                InventoryLog.objects.create(
                    product=prod,
                    change_amount=prod.stock_quantity,
                    reason=InventoryLog.Reason.RESTOCK,
                    previous_stock=0,
                    new_stock=prod.stock_quantity,
                    note="Initial warehouse stocking"
                )

        self.stdout.write(self.style.SUCCESS(f"{len(products_data)} products seeded."))

        # 4. Coupons
        now = timezone.now()
        coupons = [
            {
                "code": "WELCOME10",
                "description": "10% off for new internship platform users on any order.",
                "discount_type": Coupon.DiscountType.PERCENTAGE,
                "discount_value": Decimal("10.00"),
                "min_order_amount": Decimal("20.00"),
                "max_discount": Decimal("50.00"),
                "start_date": now - timedelta(days=10),
                "expiration_date": now + timedelta(days=90),
                "usage_limit": 500,
                "per_user_usage_limit": 3,
                "is_active": True,
            },
            {
                "code": "SAVE20",
                "description": "20% special discount on orders over $150.",
                "discount_type": Coupon.DiscountType.PERCENTAGE,
                "discount_value": Decimal("20.00"),
                "min_order_amount": Decimal("150.00"),
                "max_discount": Decimal("100.00"),
                "start_date": now - timedelta(days=5),
                "expiration_date": now + timedelta(days=60),
                "usage_limit": 200,
                "per_user_usage_limit": 2,
                "is_active": True,
            },
            {
                "code": "FLAT500",
                "description": "Flat $500 rebate discount on large enterprise equipment purchases over $1,000.",
                "discount_type": Coupon.DiscountType.FIXED_AMOUNT,
                "discount_value": Decimal("500.00"),
                "min_order_amount": Decimal("1000.00"),
                "max_discount": None,
                "start_date": now - timedelta(days=1),
                "expiration_date": now + timedelta(days=30),
                "usage_limit": 50,
                "per_user_usage_limit": 1,
                "is_active": True,
            },
            {
                "code": "EXPIRED50",
                "description": "Expired promotional coupon for testing edge cases.",
                "discount_type": Coupon.DiscountType.PERCENTAGE,
                "discount_value": Decimal("50.00"),
                "min_order_amount": Decimal("50.00"),
                "max_discount": Decimal("100.00"),
                "start_date": now - timedelta(days=60),
                "expiration_date": now - timedelta(days=5),
                "usage_limit": 100,
                "per_user_usage_limit": 1,
                "is_active": True,
            }
        ]

        for c in coupons:
            Coupon.objects.update_or_create(code=c['code'], defaults=c)

        self.stdout.write(self.style.SUCCESS("Coupons seeded."))

        # 5. Seed a couple of initial completed orders for Admin Dashboard analytics
        if not Order.objects.exists():
            prod1 = Product.objects.get(slug="apex-studio-wireless-headphones")
            prod2 = Product.objects.get(slug="merino-wool-minimalist-crewneck")

            order1 = Order.objects.create(
                customer=c1,
                order_number="ORD-20261001-A1B2C3",
                subtotal=Decimal("344.00"),
                discount=Decimal("34.40"),
                shipping_fee=Decimal("0.00"),
                total_amount=Decimal("309.60"),
                coupon=Coupon.objects.get(code="WELCOME10"),
                order_status=Order.OrderStatus.DELIVERED,
                payment_status=Order.PaymentStatus.PAID,
                shipping_full_name="John Doe",
                shipping_phone="+1 (555) 234-5678",
                shipping_address="742 Evergreen Terrace",
                shipping_city="Springfield",
                shipping_district="Oregon",
                shipping_postal_code="97477",
                shipping_country="United States",
            )
            OrderItem.objects.create(
                order=order1, product=prod1, product_name=prod1.name, product_sku=prod1.sku,
                unit_price=Decimal("249.00"), quantity=1, subtotal=Decimal("249.00")
            )
            OrderItem.objects.create(
                order=order1, product=prod2, product_name=prod2.name, product_sku=prod2.sku,
                unit_price=Decimal("95.00"), quantity=1, subtotal=Decimal("95.00")
            )
            Payment.objects.create(
                order=order1,
                transaction_id="TXN-20261001-A1B2C3",
                payment_method=Payment.Method.CARD,
                amount=Decimal("309.60"),
                status=Payment.Status.SUCCESS,
                payment_details={"card_last4": "4242", "provider": "Mock Gateway"}
            )

            # Order 2: Processing
            order2 = Order.objects.create(
                customer=c2,
                order_number="ORD-20261005-X9Y8Z7",
                subtotal=Decimal("699.00"),
                discount=Decimal("0.00"),
                shipping_fee=Decimal("0.00"),
                total_amount=Decimal("699.00"),
                order_status=Order.OrderStatus.PROCESSING,
                payment_status=Order.PaymentStatus.PAID,
                shipping_full_name="Jane Smith",
                shipping_phone="+1 (555) 876-5432",
                shipping_address="221B Baker Street",
                shipping_city="New York",
                shipping_district="Manhattan",
                shipping_postal_code="10001",
                shipping_country="United States",
            )
            disp_prod = Product.objects.get(slug="nova-4k-oled-ultra-display")
            OrderItem.objects.create(
                order=order2, product=disp_prod, product_name=disp_prod.name, product_sku=disp_prod.sku,
                unit_price=Decimal("699.00"), quantity=1, subtotal=Decimal("699.00")
            )
            Payment.objects.create(
                order=order2,
                transaction_id="TXN-20261005-X9Y8Z7",
                payment_method=Payment.Method.MOBILE_BANKING,
                amount=Decimal("699.00"),
                status=Payment.Status.SUCCESS,
                payment_details={"account": "jane_pay", "provider": "Mock Gateway"}
            )

            self.stdout.write(self.style.SUCCESS("Sample orders seeded."))

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
