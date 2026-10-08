import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  MapPin,
  ChevronLeft,
  XCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import api from '../services/api';
import { Order } from '../types';
import { Badge } from '../components/common/Badge';
import { useToast } from '../context/ToastContext';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { showToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancelling, setCancelling] = useState<boolean>(false);

  const orderJustPlaced = (location.state as any)?.orderPlaced;

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/orders/${id}/`);
      setOrder(res.data);
    } catch (err) {
      console.error('Failed to load order', err);
      showToast('Order not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!window.confirm('Are you sure you want to cancel this order? This will restock the inventory and refund payment.')) {
      return;
    }

    setCancelling(true);
    try {
      const res = await api.post(`/api/orders/${order.id}/cancel/`);
      if (res.data?.success) {
        showToast(res.data.message || 'Order cancelled and inventory restocked!', 'info');
        setOrder(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStepIndex = steps.indexOf(order.order_status);
  const isCancelled = order.order_status === 'CANCELLED';

  const canCancel = order.order_status === 'PENDING' || order.order_status === 'CONFIRMED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Celebration Banner if just placed */}
      {orderJustPlaced && (
        <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-700/50 flex items-start gap-4 shadow-xl">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">
              Thank You! Your Order has been Placed &amp; Confirmed!
            </h2>
            <p className="text-xs text-emerald-200/90 leading-relaxed">
              The transaction was safely committed to MySQL 8 InnoDB. Inventory was decremented atomically with row locks, and mock payment approval was recorded.
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/orders" className="hover:text-white flex items-center gap-1">
              <ChevronLeft className="w-3.5 h-3.5" /> Back to Orders
            </Link>
            <span>&bull;</span>
            <span>Placed {new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
            {order.order_number}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Badge status={order.order_status} type="order" />
          <Badge status={order.payment_status} type="payment" />

          {canCancel && (
            <button
              onClick={handleCancelOrder}
              disabled={cancelling}
              className="px-3.5 py-1.5 rounded-xl border border-rose-800/80 bg-rose-950/40 text-rose-300 text-xs font-semibold hover:bg-rose-900/60 transition-all flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              <span>{cancelling ? 'Restocking...' : 'Cancel Order'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Order Tracking Stepper */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Truck className="w-4 h-4 text-indigo-400" />
          Fulfillment Timeline
        </h3>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/40 text-xs text-rose-300 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>This order was cancelled. Items have been restocked to warehouse inventory.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {steps.map((st, idx) => {
              const completed = currentStepIndex >= idx;
              const active = currentStepIndex === idx;

              return (
                <div key={st} className="flex flex-col items-center text-center space-y-2">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      completed
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {completed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      active ? 'text-indigo-400' : completed ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ordered Items */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-white">Order Items</h3>
          <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800 divide-y divide-slate-800/80">
            {order.items.map((item) => (
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white text-sm">{item.product_name}</div>
                  <div className="text-slate-400 font-mono mt-0.5">
                    SKU: {item.product_sku} &bull; {item.quantity} &times; ${parseFloat(item.unit_price).toFixed(2)}
                  </div>
                </div>
                <div className="font-bold font-mono text-white text-sm">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Shipping & Payment Summary Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shipping Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                Shipping Destination
              </h4>
              <div className="text-slate-300 font-medium">{order.shipping_full_name}</div>
              <div className="text-slate-400 leading-relaxed">
                {order.shipping_address}, {order.shipping_city}, {order.shipping_postal_code}
                <br />
                {order.shipping_country}
              </div>
              <div className="text-slate-400 font-mono">Tel: {order.shipping_phone}</div>
            </div>

            {/* Payment Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                Payment Record
              </h4>
              <div className="text-slate-300">
                Method: <span className="font-semibold">{order.payment?.payment_method?.replace(/_/g, ' ') || 'CARD'}</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px] truncate">
                Txn ID: {order.payment?.transaction_id || 'N/A'}
              </div>
              <div className="text-emerald-400 font-semibold">
                Status: {order.payment?.status || 'APPROVED'}
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div>
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">
              Payment Summary
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-mono text-white">${parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shipping Fee</span>
                <span className="font-mono text-white">
                  ${parseFloat(order.shipping_fee).toFixed(2)}
                </span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount ({order.coupon_details?.code || 'COUPON'})</span>
                  <span className="font-mono">-${parseFloat(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="font-mono text-xl text-indigo-400 font-extrabold">
                  ${parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>Customer: {order.customer_username} ({order.customer_email})</div>
              <div>Database Engine: MySQL 8 InnoDB</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
