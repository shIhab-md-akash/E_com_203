import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const CartPage: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);

  const subtotal = parseFloat(cart?.subtotal || '0');
  const shipping = parseFloat(cart?.estimated_shipping || '0');
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal - discount + shipping);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await api.post('/api/coupons/validate/', {
        code: couponCode.trim(),
        order_amount: subtotal.toFixed(2),
      });

      if (res.data?.success) {
        setAppliedCoupon({
          code: res.data.data.code,
          discountAmount: parseFloat(res.data.data.discount_amount),
          finalAmount: parseFloat(res.data.data.final_amount),
        });
        showToast(`Coupon '${res.data.data.code}' applied successfully!`, 'success');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Invalid or expired coupon code.';
      showToast(msg, 'error');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleProceedToCheckout = () => {
    // Navigate to checkout and pass applied coupon if present
    navigate('/checkout', {
      state: {
        couponCode: appliedCoupon?.code || '',
        discountAmount: discount,
      },
    });
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500 shadow-xl">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Your shopping cart is empty
        </h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Explore our wide range of electronics, apparel, homeware, and outdoor gear.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Authoritative server-side prices &amp; stock verification
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" /> Clear All Items
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                <img
                  src={item.product.product_image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1 text-center sm:text-left">
                <Link
                  to={`/products/${item.product.id}`}
                  className="font-semibold text-sm text-white hover:text-indigo-400 truncate block transition-colors"
                >
                  {item.product.name}
                </Link>
                <div className="text-xs text-slate-400 font-mono">
                  Unit Price: ${parseFloat(item.unit_price).toFixed(2)} &bull; SKU: {item.product.sku}
                </div>
                <div className="text-[11px] text-emerald-400 font-medium">
                  {item.product.stock_quantity} available in stock
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center border border-slate-700 bg-slate-800/80 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="px-2.5 py-1 text-slate-300 hover:text-white text-xs font-bold"
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-bold text-white font-mono">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.stock_quantity}
                  className="px-2.5 py-1 text-slate-300 hover:text-white disabled:opacity-30 text-xs font-bold"
                >
                  +
                </button>
              </div>

              {/* Item Subtotal */}
              <div className="text-right shrink-0 min-w-[70px]">
                <div className="font-bold text-sm text-white font-mono">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-slate-400 hover:text-rose-400 transition-colors"
                title="Remove item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">
              Order Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal ({cart.item_count} items)</span>
                <span className="font-mono text-white font-semibold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1">
                  Estimated Shipping
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                </span>
                <span className="font-mono text-white font-semibold">
                  {shipping === 0 ? (
                    <span className="text-emerald-400 uppercase font-bold text-[11px]">Free</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="font-mono text-xl text-indigo-400 font-extrabold">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-slate-800/80">
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. WELCOME10, SAVE20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 uppercase font-mono bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 disabled:opacity-40"
                  >
                    {validatingCoupon ? 'Validating...' : 'Apply'}
                  </button>
                </div>
              </form>

              {/* Active Demo Codes Hint */}
              <div className="mt-2 text-[11px] text-slate-400">
                Try: <span className="text-indigo-400 font-mono font-bold">WELCOME10</span> (10% off) or <span className="text-indigo-400 font-mono font-bold">SAVE20</span> (20% off &gt;$150)
              </div>
            </div>

            {/* Checkout CTA */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
