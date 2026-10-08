import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Smartphone,
  Truck,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ArrowRight,
  CheckCircle2,
  Tag,
  Building
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CheckoutPage: React.FC = () => {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Location state might have coupon passed from CartPage
  const initialCoupon = (location.state as any)?.couponCode || '';

  // Shipping Form State
  const [fullName, setFullName] = useState(user?.first_name ? `${user.first_name} ${user.last_name}` : '');
  const [phone, setPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [address, setAddress] = useState('742 Evergreen Terrace');
  const [city, setCity] = useState('Springfield');
  const [district, setDistrict] = useState('Oregon');
  const [postalCode, setPostalCode] = useState('97477');
  const [country, setCountry] = useState('United States');

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'MOBILE_BANKING' | 'CASH_ON_DELIVERY'>('CARD');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [mobilePhone, setMobilePhone] = useState('+1 (555) 019-2831');

  // Coupon state
  const [couponCode, setCouponCode] = useState(initialCoupon);

  // QA Failure Simulator
  const [simulateFailure, setSimulateFailure] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Load saved default address if available
  useEffect(() => {
    api.get('/api/auth/addresses/')
      .then((res) => {
        const addresses = res.data?.results || res.data || [];
        const defaultAddr = addresses.find((a: any) => a.is_default) || addresses[0];
        if (defaultAddr) {
          setFullName(defaultAddr.full_name || fullName);
          setPhone(defaultAddr.phone || phone);
          setAddress(defaultAddr.street_address || address);
          setCity(defaultAddr.city || city);
          setDistrict(defaultAddr.district || district);
          setPostalCode(defaultAddr.postal_code || postalCode);
          setCountry(defaultAddr.country || country);
        }
      })
      .catch(() => {});
  }, []);

  const subtotal = parseFloat(cart?.subtotal || '0');
  const shipping = parseFloat(cart?.estimated_shipping || '0');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      showToast('Cannot checkout with an empty cart.', 'error');
      return;
    }

    if (!fullName || !phone || !address || !city || !postalCode) {
      showToast('Please fill in all required shipping address fields.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        shipping_full_name: fullName,
        shipping_phone: phone,
        shipping_address: address,
        shipping_city: city,
        shipping_district: district,
        shipping_postal_code: postalCode,
        shipping_country: country,
        payment_method: paymentMethod,
        coupon_code: couponCode.trim(),
        card_number: cardNumber,
        card_exp: cardExp,
        card_cvv: cardCvv,
        mobile_phone: mobilePhone,
        simulate_failure: simulateFailure,
      };

      const response = await api.post('/api/orders/checkout/', payload);

      if (response.data?.success) {
        showToast('Order confirmed and inventory deducted successfully!', 'success');
        await refreshCart();
        const createdOrder = response.data.data;
        navigate(`/orders/${createdOrder.id}`, {
          state: { orderPlaced: true },
        });
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        'Transaction failed during checkout. MySQL rolled back changes.';
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <button
          onClick={() => navigate('/products')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"
        >
          Return to Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Checkout &amp; Mock Payment
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Atomic database transaction &bull; Row locks on MySQL InnoDB &bull; Immediate Inventory Sync
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Shipping & Payment Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Address */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Truck className="w-5 h-5 text-indigo-400" />
              1. Shipping Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">State / District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Postal Code *</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Mock Payment */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                2. Mock Payment Simulation
              </h2>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Sandbox Mode
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  paymentMethod === 'CARD'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-white">Credit / Debit</div>
                  <div className="text-[10px] text-slate-400">Mock Card Gateway</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('MOBILE_BANKING')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  paymentMethod === 'MOBILE_BANKING'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5 text-sky-400" />
                <div>
                  <div className="text-xs font-bold text-white">Mobile Wallet</div>
                  <div className="text-[10px] text-slate-400">Mock bKash / Venmo</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-md'
                    : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                <Truck className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="text-xs font-bold text-white">Cash on Delivery</div>
                  <div className="text-[10px] text-slate-400">Pay upon delivery</div>
                </div>
              </button>
            </div>

            {/* Card Inputs */}
            {paymentMethod === 'CARD' && (
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Simulated Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">CVV Security Code</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* QA Testing Failure Switch */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <div className="font-bold text-amber-200">
                  Internship Testing: Transaction Rollback Simulator
                </div>
                <p className="text-amber-300/80 mt-0.5">
                  Enable this to simulate payment failure. Verifies that Django triggers a database rollback: no order is created and inventory stock remains unchanged.
                </p>
                <label className="flex items-center gap-2 mt-2 cursor-pointer font-semibold text-amber-200">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 bg-slate-900 border-amber-700"
                  />
                  <span>Simulate Payment Failure (Trigger Transaction Rollback)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">
              Items to Purchase ({cart.items.length})
            </h3>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 text-xs">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.product.product_image}
                      alt={item.product.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 bg-slate-800"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-white truncate">{item.product.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {item.quantity} &times; ${parseFloat(item.unit_price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-white font-bold shrink-0">
                    ${parseFloat(item.subtotal).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon field */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-400" />
                Coupon Code (Optional)
              </label>
              <input
                type="text"
                placeholder="WELCOME10, SAVE20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full uppercase font-mono bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Shipping</span>
                <span className="font-mono text-white">
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-white">
                <span>Estimated Total</span>
                <span className="font-mono text-xl text-indigo-400 font-extrabold">
                  ${(subtotal + shipping).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              <span>{submitting ? 'Executing Atomic Transaction...' : 'Confirm & Place Order'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
