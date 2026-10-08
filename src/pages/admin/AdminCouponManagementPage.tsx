import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, XCircle, X } from 'lucide-react';
import api from '../../services/api';
import { Coupon } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCouponManagementPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'PERCENTAGE',
    discount_value: '15.00',
    min_order_amount: '50.00',
    max_discount: '30.00',
    start_date: new Date().toISOString().slice(0, 16),
    expiration_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    usage_limit: 100,
    per_user_usage_limit: 1,
    is_active: true,
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/coupons/');
      setCoupons(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/coupons/', {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        max_discount: formData.max_discount ? formData.max_discount : null,
      });
      showToast('Coupon created successfully!', 'success');
      setModalOpen(false);
      fetchCoupons();
    } catch (err: any) {
      showToast('Failed to create coupon.', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete coupon?')) return;
    try {
      await api.delete(`/api/coupons/${id}/`);
      showToast('Coupon removed.', 'info');
      fetchCoupons();
    } catch (err) {
      showToast('Failed to delete coupon.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Promotional Coupons &amp; Discount Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure global percentage or fixed rebates with minimum cart restrictions
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Coupon</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Type &amp; Value</th>
                <th className="p-4">Min Spend</th>
                <th className="p-4">Total Used</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No coupons created.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const isExpired = new Date(c.expiration_date) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-mono font-bold text-white text-sm tracking-wide">
                          {c.code}
                        </div>
                        <div className="text-[11px] text-slate-400">{c.description}</div>
                      </td>
                      <td className="p-4 font-mono font-semibold text-emerald-400">
                        {c.discount_type === 'PERCENTAGE'
                          ? `${parseFloat(c.discount_value)}% OFF`
                          : `$${parseFloat(c.discount_value)} FLAT`}
                      </td>
                      <td className="p-4 font-mono text-slate-300">
                        ${parseFloat(c.min_order_amount).toFixed(2)}
                      </td>
                      <td className="p-4 font-mono">
                        {c.total_used} / {c.usage_limit || 'Unlimited'}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-400">
                        {new Date(c.expiration_date).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            EXPIRED
                          </span>
                        ) : c.is_active ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
                            INACTIVE
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">Create Promotional Coupon</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH30"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="PERCENTAGE">PERCENTAGE</option>
                    <option value="FIXED_AMOUNT">FIXED AMOUNT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Min Order ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.min_order_amount}
                    onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Max Cap ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Expiration Date</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.expiration_date}
                  onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
