import React, { useEffect, useState } from 'react';
import {
  Boxes,
  RotateCcw,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  History,
  Plus,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { Product, InventoryLog } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminInventoryPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [restockingId, setRestockingId] = useState<number | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, logRes] = await Promise.all([
        api.get('/api/products/?page_size=50'),
        api.get('/api/inventory/logs/'),
      ]);
      setProducts(prodRes.data?.results || []);
      setLogs(logRes.data?.results || logRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQuickRestock = async (product: Product) => {
    try {
      const newStock = product.stock_quantity + Number(restockAmount);
      await api.patch(`/api/products/${product.id}/`, { stock_quantity: newStock });
      showToast(`Restocked ${restockAmount} units for ${product.name}!`, 'success');
      setRestockingId(null);
      fetchData();
    } catch (err) {
      showToast('Failed to restock.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Inventory &amp; Audit Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time warehouse stock tracking &bull; Atomic ledger logs on MySQL
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stock Levels Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Boxes className="w-4 h-4 text-indigo-400" />
            Product Stock Balances
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {products.length} products monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Current Stock</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {products.map((p) => {
                const isLow = p.stock_quantity <= 5;
                const isOut = p.stock_quantity <= 0;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-semibold text-white">{p.name}</td>
                    <td className="p-3.5 font-mono text-slate-400">{p.sku}</td>
                    <td className="p-3.5 font-mono font-bold">
                      <span
                        className={`px-2 py-0.5 rounded ${
                          isOut
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : isLow
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'text-slate-200'
                        }`}
                      >
                        {p.stock_quantity} units
                      </span>
                    </td>
                    <td className="p-3.5">
                      {isOut ? (
                        <span className="text-rose-400 font-bold text-[10px]">OUT OF STOCK</span>
                      ) : isLow ? (
                        <span className="text-amber-400 font-bold text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> LOW STOCK
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold text-[10px]">OPTIMAL</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {restockingId === p.id ? (
                        <div className="inline-flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={restockAmount}
                            onChange={(e) => setRestockAmount(parseInt(e.target.value) || 1)}
                            className="w-16 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono"
                          />
                          <button
                            onClick={() => handleQuickRestock(p)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setRestockingId(null)}
                            className="text-slate-400 hover:text-white text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setRestockingId(p.id);
                            setRestockAmount(15);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold text-[11px] flex items-center gap-1 ml-auto"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Restock</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Audit Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            MySQL Audit Trail Ledger (apps.inventory.models.InventoryLog)
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {logs.length} transactions recorded
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Change</th>
                <th className="p-3.5">Previous &rarr; New</th>
                <th className="p-3.5">Reference / Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => {
                const isDeduction = log.change_amount < 0;
                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{log.product_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.product_sku}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono font-semibold uppercase text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {log.reason}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isDeduction ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isDeduction ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                        {log.change_amount > 0 ? `+${log.change_amount}` : log.change_amount}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {log.previous_stock} &rarr; <strong className="text-white">{log.new_stock}</strong>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-400 font-semibold">
                      {log.reference_id || 'System'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
