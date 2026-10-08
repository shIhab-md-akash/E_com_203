import React, { useEffect, useState } from 'react';
import { Users, ShieldCheck, UserX, UserCheck, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { User } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/admin/customers/');
      setCustomers(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id: number) => {
    try {
      const res = await api.patch(`/api/auth/admin/customers/${id}/toggle-status/`);
      if (res.data?.success) {
        showToast(res.data.message, 'success');
        fetchCustomers();
      }
    } catch (err) {
      showToast('Failed to toggle customer status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Customer Directory &amp; RBAC Accounts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered customer accounts stored securely with hashed passwords in MySQL
          </p>
        </div>

        <button
          onClick={fetchCustomers}
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
                <th className="p-4">Customer</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Role</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Account Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 font-bold flex items-center justify-center uppercase text-xs">
                        {c.username?.[0] || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {c.first_name || c.last_name ? `${c.first_name} ${c.last_name}` : c.username}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">@{c.username}</div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{c.email}</td>
                    <td className="p-4 text-slate-400 font-mono">{c.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                        {c.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      {c.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(c.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                        >
                          Toggle Active
                        </button>
                      )}
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
