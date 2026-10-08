import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Heart,
  ShoppingBag,
  User,
  ArrowRight,
  Clock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import api from '../services/api';
import { Order } from '../types';
import { Badge } from '../components/common/Badge';

export const CustomerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get('/api/orders/?page_size=5')
      .then((res) => setRecentOrders(res.data?.results || res.data || []))
      .catch((err) => console.error('Error fetching recent orders', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            <User className="w-3.5 h-3.5" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hello, {user?.first_name || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Welcome to your personal dashboard. Track orders, manage addresses, and view your saved items.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/products"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Shop Catalog</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/orders"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Total Orders</span>
            <div className="text-2xl font-extrabold text-white font-mono">
              {recentOrders.length}
            </div>
            <div className="text-[11px] text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
              <span>View History</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Package className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/cart"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Cart Items</span>
            <div className="text-2xl font-extrabold text-white font-mono">{itemCount}</div>
            <div className="text-[11px] text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
              <span>Proceed to Checkout</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/wishlist"
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium">Saved Items</span>
            <div className="text-2xl font-extrabold text-white font-mono">{wishlistCount}</div>
            <div className="text-[11px] text-indigo-400 font-semibold group-hover:underline flex items-center gap-1">
              <span>View Wishlist</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <Heart className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Recent Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Recent Purchases
          </h2>
          <Link
            to="/orders"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
          >
            View All
          </Link>
        </div>

        {loading ? (
          <div className="h-40 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
            No orders placed yet. Add items to your cart and checkout to create your first order!
          </div>
        ) : (
          <div className="divide-y divide-slate-800 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            {recentOrders.map((o) => (
              <div key={o.id} className="p-4 flex items-center justify-between text-xs gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{o.order_number}</span>
                    <Badge status={o.order_status} type="order" />
                  </div>
                  <div className="text-slate-400">
                    {new Date(o.created_at).toLocaleDateString()} &bull; {o.items?.length || 1} item(s)
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-white text-sm">
                    ${parseFloat(o.total_amount).toFixed(2)}
                  </span>
                  <Link
                    to={`/orders/${o.id}`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
