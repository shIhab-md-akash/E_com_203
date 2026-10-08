"""
Django settings for ApexStore Mini E-Commerce project.
Configured for MySQL 8 / MariaDB (InnoDB).
"""

import os
from pathlib import Path
from datetime import timedelta
import dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

dotenv.load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'insecure-key-default-apex-store-2026')
DEBUG = os.getenv('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party packages
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_spectacular',

    # Local application apps
    'apps.users.apps.UsersConfig',
    'apps.categories.apps.CategoriesConfig',
    'apps.products.apps.ProductsConfig',
    'apps.inventory.apps.InventoryConfig',
    'apps.cart.apps.CartConfig',
    'apps.wishlist.apps.WishlistConfig',
    'apps.coupons.apps.CouponsConfig',
    'apps.orders.apps.OrdersConfig',
    'apps.payments.apps.PaymentsConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database Configuration: MySQL 8 (InnoDB)
DB_NAME = os.getenv('DB_NAME', 'ecommerce_db')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
DB_PORT = os.getenv('DB_PORT', '3306')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': DB_NAME,
        'USER': DB_USER,
        'PASSWORD': DB_PASSWORD,
        'HOST': DB_HOST,
        'PORT': DB_PORT,
        'OPTIONS': {
            'charset': 'utf8mb4',
            'init_command': "SET default_storage_engine=INNODB,sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 6},
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# SimpleJWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'SIGNING_KEY': os.getenv('JWT_SECRET_KEY', SECRET_KEY),
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# drf-spectacular OpenAPI / Swagger UI
SPECTACULAR_SETTINGS = {
    'TITLE': 'ApexStore Mini E-Commerce & Order Management API',
    'DESCRIPTION': 'Comprehensive REST API documentation for ApexStore e-commerce platform. Covers Authentication, Products, Categories, Cart, Wishlist, Coupons, Orders, Payments, Inventory, and Admin Analytics.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}
