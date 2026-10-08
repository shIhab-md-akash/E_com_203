import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Truck, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/common/Badge';

export const OrderTrackingPage: React.FC = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<any | null>(null);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setOrderData(null);
    try {
      const res = await api.get(`/api/orders/track/${encodeURIComponent(orderNumber.trim())}/`);
      if (res.data?.success) {
        setOrderData(res.data.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Order number not found.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
          Enter your order reference code (e.g. <span className="font-mono text-indigo-300">ORD-20261001-A1B2C3</span>) to check fulfillment status.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleTrack} className="flex gap-2">
        <input
          type="text"
          placeholder="Enter Order Number (e.g. ORD-202610...)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading || !orderNumber.trim()}
          className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all disabled:opacity-40"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Result Card */}
      {orderData && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="text-xs text-slate-400">Order Reference</div>
              <div className="font-mono font-bold text-lg text-white">{orderData.order_number}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge status={orderData.order_status} type="order" />
              <Badge status={orderData.payment_status} type="payment" />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400">Date</span>
              <div className="font-semibold text-white mt-0.5">
                {new Date(orderData.created_at).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Items</span>
              <div className="font-semibold text-white mt-0.5">
                {orderData.items?.length || 0} product(s)
              </div>
            </div>
            <div>
              <span className="text-slate-400">Total</span>
              <div className="font-mono font-bold text-white mt-0.5">
                ${parseFloat(orderData.total_amount).toFixed(2)}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Ship To</span>
              <div className="font-semibold text-white mt-0.5 truncate">
                {orderData.shipping_city}, {orderData.shipping_country}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate(`/orders/${orderData.id}`)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <span>View Full Order Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
