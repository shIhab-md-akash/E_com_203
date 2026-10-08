import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Search, Clock, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { Badge } from '../components/common/Badge';

export const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const url = statusFilter === 'ALL' ? '/api/orders/' : `/api/orders/?status=${statusFilter}`;
        const res = await api.get(url);
        setOrders(res.data?.results || res.data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Order History
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review, track, and manage all your customer purchases
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-colors shrink-0 ${
              statusFilter === st
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <Package className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-bold text-base text-white">No orders found</h3>
          <p className="text-xs text-slate-400">
            You don't have any orders with the selected status.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="group block p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all shadow-sm hover:shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-white font-mono group-hover:text-indigo-400 transition-colors">
                      {o.order_number}
                    </span>
                    <Badge status={o.order_status} type="order" />
                    <Badge status={o.payment_status} type="payment" />
                  </div>
                  <div className="text-xs text-slate-400">
                    Placed on {new Date(o.created_at).toLocaleDateString()} &bull; {o.items?.length || 1} item(s)
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <div className="font-bold text-base text-white font-mono">
                      ${parseFloat(o.total_amount).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400 capitalize">
                      {o.payment?.payment_method?.replace(/_/g, ' ') || 'Paid'}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
