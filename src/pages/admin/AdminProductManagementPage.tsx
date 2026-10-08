import React, { useEffect, useState, useCallback } from 'react';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import api from '../../services/api';
import { Product, Category } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';

export const AdminProductManagementPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { showToast } = useToast();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    discount_price: '',
    sku: '',
    stock_quantity: 10,
    brand: '',
    product_image: '',
    description: '',
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories/');
      setCategories(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedCategory) params.set('category', selectedCategory);
      params.set('page_size', '50');

      const res = await api.get(`/api/products/?${params.toString()}`);
      setProducts(res.data?.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: categories[0]?.id?.toString() || '',
      price: '',
      discount_price: '',
      sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      stock_quantity: 20,
      brand: 'ApexStudio',
      product_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      description: '',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category?.toString() || '',
      price: product.price,
      discount_price: product.discount_price || '',
      sku: product.sku,
      stock_quantity: product.stock_quantity,
      brand: product.brand || '',
      product_image: product.product_image,
      description: product.description,
      status: product.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = {
        name: formData.name,
        category: parseInt(formData.category),
        price: formData.price,
        discount_price: formData.discount_price ? formData.discount_price : null,
        sku: formData.sku,
        stock_quantity: parseInt(formData.stock_quantity as any),
        brand: formData.brand,
        product_image: formData.product_image,
        description: formData.description,
        status: formData.status,
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}/`, payload);
        showToast('Product updated successfully!', 'success');
      } else {
        await api.post('/api/products/', payload);
        showToast('Product created successfully!', 'success');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save product.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}/`);
      showToast('Product deleted.', 'info');
      fetchProducts();
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, restock, or remove catalog inventory products
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Item</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stock_quantity <= 5;
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={p.product_image}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0"
                        />
                        <div className="max-w-[220px]">
                          <div className="font-semibold text-white truncate">{p.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">SKU: {p.sku}</div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300">
                        {p.category_details?.name || 'Category'}
                      </td>
                      <td className="p-4 font-mono font-bold text-white">
                        ${parseFloat(p.current_price).toFixed(2)}
                      </td>
                      <td className="p-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                            isLow
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'text-slate-300'
                          }`}
                        >
                          {p.stock_quantity} units
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge status={p.status} type="stock" />
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-4 text-xs shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discount Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">SKU Unique Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Product Image URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.product_image}
                    onChange={(e) => setFormData({ ...formData, product_image: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
