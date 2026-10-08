export type UserRole = 'ADMIN' | 'CUSTOMER';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'ACTIVE' | 'INACTIVE';
  products_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: number;
  category_details?: Category;
  price: string;
  discount_price: string | null;
  current_price: string;
  sku: string;
  stock_quantity: number;
  product_image: string;
  additional_images: string[];
  brand: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: number;
  product: Product;
  product_id?: number;
  quantity: number;
  unit_price: string;
  subtotal: string;
  created_at: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: string;
  estimated_shipping: string;
  item_count: number;
  grand_total: string;
  updated_at: string;
}

export interface WishlistItem {
  id: number;
  product: Product;
  created_at: string;
}

export interface Wishlist {
  id: number;
  items: WishlistItem[];
  total_items: number;
}

export interface Coupon {
  id: number;
  code: string;
  description: string;
  discount_type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discount_value: string;
  min_order_amount: string;
  max_discount: string | null;
  start_date: string;
  expiration_date: string;
  usage_limit: number | null;
  per_user_usage_limit: number;
  is_active: boolean;
  total_used: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface Payment {
  id: number;
  transaction_id: string;
  payment_method: 'CARD' | 'MOBILE_BANKING' | 'CASH_ON_DELIVERY';
  amount: string;
  status: 'SUCCESS' | 'FAILED';
  payment_details: Record<string, any>;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer: number;
  customer_username: string;
  customer_email: string;
  subtotal: string;
  discount: string;
  shipping_fee: string;
  total_amount: string;
  coupon?: number;
  coupon_details?: Coupon;
  order_status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  shipping_full_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postal_code: string;
  shipping_country: string;
  notes: string;
  items: OrderItem[];
  payment?: Payment;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: number;
  user?: number;
  full_name: string;
  phone: string;
  street_address: string;
  city: string;
  district: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

export interface InventoryLog {
  id: number;
  product: number;
  product_name: string;
  product_sku: string;
  change_amount: number;
  reason: 'PURCHASE' | 'RESTOCK' | 'RETURN' | 'CANCELLATION' | 'ADJUSTMENT';
  previous_stock: number;
  new_stock: number;
  reference_id: string;
  note: string;
  created_at: string;
}

export interface AdminStats {
  total_customers: number;
  total_products: number;
  total_orders: number;
  pending_orders: number;
  completed_orders: number;
  total_revenue: number;
  low_stock_products: number;
  active_coupons: number;
  orders_by_status: Record<string, number>;
  top_products: Array<{ name: string; sold: number; revenue: number }>;
  recent_orders: Array<{
    id: number;
    order_number: string;
    customer: string;
    total_amount: number;
    order_status: string;
    created_at: string;
  }>;
}
