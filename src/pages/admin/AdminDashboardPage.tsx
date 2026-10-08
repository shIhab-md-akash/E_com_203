import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Tag,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { AdminStats } from '../../types';
import { Badge } from '../../components/common/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/admin/dashboard-stats/')
      .then((res) => {
        if (res.data?.success) {
          setStats(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load admin stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Revenue', value: `$${stats.total_revenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Total Orders', value: stats.total_orders, icon: ShoppingBag, color: 'text-indigo-400 bg-indigo-500/10' },
    { label: 'Total Products', value: stats.total_products, icon: Package, color: 'text-sky-400 bg-sky-500/10' },
    { label: 'Active Customers', value: stats.total_customers, icon: Users, color: 'text-purple-400 bg-purple-500/10' },
    { label: 'Pending Fulfillment', value: stats.pending_orders, icon: Clock, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Delivered Orders', value: stats.completed_orders, icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Low Stock Alerts', value: stats.low_stock_products, icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10' },
    { label: 'Active Coupons', value: stats.active_coupons, icon: Tag, color: 'text-indigo-400 bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Executive Analytics &amp; Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time MySQL InnoDB aggregated KPIs and operational statistics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md"
          >
            Manage Products
          </Link>
          <a
            href="/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
          >
            <span>Swagger API</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between shadow-sm"
            >
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">{kpi.label}</span>
                <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
                  {kpi.value}
                </div>
              </div>
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Orders by Status Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            Orders by Fulfillment Status
          </h2>

          <div className="space-y-3 pt-2">
            {Object.entries(stats.orders_by_status).map(([st, cnt]) => {
              const pct = stats.total_orders > 0 ? Math.round((cnt / stats.total_orders) * 100) : 0;
              return (
                <div key={st} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="font-semibold uppercase text-[11px] tracking-wide">{st}</span>
                    <span className="font-mono font-bold text-white">
                      {cnt} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        st === 'DELIVERED'
                          ? 'bg-emerald-500'
                          : st === 'SHIPPED'
                          ? 'bg-sky-500'
                          : st === 'CONFIRMED'
                          ? 'bg-indigo-500'
                          : st === 'PROCESSING'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Top Selling Products by Volume
          </h2>

          {stats.top_products.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No product purchase volume recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800 text-xs">
              {stats.top_products.map((p, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-0.5 max-w-[240px] truncate">
                    <div className="font-semibold text-white truncate">{p.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      {p.sold} unit(s) sold
                    </div>
                  </div>
                  <div className="font-bold text-emerald-400 font-mono text-sm">
                    ${p.revenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Recent Customer Transactions
          </h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3 rounded-l-xl">Order Number</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stats.recent_orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-mono font-semibold text-white">{o.order_number}</td>
                  <td className="p-3 text-slate-300">{o.customer}</td>
                  <td className="p-3 font-mono font-bold text-white">
                    ${o.total_amount.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <Badge status={o.order_status} type="order" />
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/orders/${o.id}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-[11px]"
                    >
                      Inspect
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
