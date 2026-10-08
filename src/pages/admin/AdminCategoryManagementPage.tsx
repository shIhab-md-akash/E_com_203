import React, { useEffect, useState } from 'react';
import { Layers, Plus, Trash2, Edit, X } from 'lucide-react';
import api from '../../services/api';
import { Category } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    status: 'ACTIVE',
  });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/categories/');
      setCategories(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      status: category.status,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory.id}/`, formData);
        showToast('Category updated.', 'success');
      } else {
        await api.post('/api/categories/', formData);
        showToast('Category created.', 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast('Failed to save category.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this category? Products linked will need reassignment.')) return;
    try {
      await api.delete(`/api/categories/${id}/`);
      showToast('Category deleted.', 'info');
      fetchCategories();
    } catch (err) {
      showToast('Failed to delete category.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Category Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize catalog classifications and homepage showcases
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="h-32 rounded-2xl overflow-hidden bg-slate-800 relative">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white">
                  {c.products_count ?? 0} Products
                </span>
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{c.name}</h3>
                <div className="text-[11px] font-mono text-indigo-400">/{c.slug}</div>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                  {c.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => handleOpenEdit(c)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs"
                title="Delete Category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Slug</label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-slugify"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
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
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
