import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { Order } from '../../types';
import { Badge } from '../../components/common/Badge';
import { useToast } from '../../context/ToastContext';

export const AdminOrderManagementPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders/?page_size=100');
      setOrders(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await api.patch(`/api/orders/${orderId}/status/`, {
        order_status: newStatus,
      });
      if (res.data?.success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        fetchOrders();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: number, newPaymentStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await api.patch(`/api/orders/${orderId}/status/`, {
        payment_status: newPaymentStatus,
      });
      if (res.data?.success) {
        showToast(`Payment status updated to ${newPaymentStatus}`, 'success');
        fetchOrders();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update payment status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Order Fulfillment &amp; Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track customer orders, update statuses, manage refunds, and inspect transaction records
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No customer orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-semibold text-white">
                      {o.order_number}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-white">{o.customer_username}</div>
                      <div className="text-[11px] text-slate-400">{o.customer_email}</div>
                    </td>
                    <td className="p-4 text-slate-300">{o.items?.length || 1} items</td>
                    <td className="p-4 font-mono font-bold text-white">
                      ${parseFloat(o.total_amount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <select
                        value={o.order_status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.payment_status}
                        disabled={updatingId === o.id}
                        onChange={(e) => handleUpdatePaymentStatus(o.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PAID">PAID</option>
                        <option value="PENDING">PENDING</option>
                        <option value="FAILED">FAILED</option>
                        <option value="REFUNDED">REFUNDED</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/orders/${o.id}`}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
