import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import api from '../services/api';
import { Category } from '../types';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.get('/api/categories/')
      .then((res) => setCategories(res.data?.results || res.data || []))
      .catch((err) => console.error('Failed to load categories', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
          <Layers className="w-4 h-4" />
          <span>Department Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
          Product Categories
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Browse items by category with verified real-time stock balances in MySQL
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all shadow-md hover:shadow-2xl hover:shadow-indigo-950/40"
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent flex flex-col justify-end p-6 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {c.name}
                  </h3>
                  <div className="p-2 rounded-full bg-white/10 group-hover:bg-indigo-600 text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>
                <div className="text-[11px] font-mono text-indigo-400 font-semibold pt-1">
                  {c.products_count !== undefined ? `${c.products_count} active products` : 'View products'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
