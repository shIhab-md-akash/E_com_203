import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  RotateCcw,
  Tag,
  Star,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Database
} from 'lucide-react';
import api from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/api/products/?page_size=8'),
          api.get('/api/categories/'),
        ]);
        setFeaturedProducts(prodRes.data?.results || []);
        setCategories(catRes.data?.results || catRes.data || []);
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-b border-slate-800/80 pt-12 pb-20">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Full-Stack Internship Portfolio Project</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              <span className="font-mono text-[11px] text-slate-300">Django 5 + MySQL 8</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Engineered for Speed, Scale &amp;{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-indigo-200">
                Data Integrity
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              A high-precision e-commerce platform built with Django REST Framework, atomic MySQL InnoDB row locking, shopping cart, coupons, mock payments, and admin analytics.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/docs"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Database className="w-4 h-4 text-indigo-400" />
                <span>View Architecture &amp; ERD</span>
              </Link>
            </div>

            {/* Quick Demo Pill */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
              <span>Try Coupons:</span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono font-semibold border border-indigo-800/40">
                WELCOME10 (-10%)
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono font-semibold border border-indigo-800/40">
                SAVE20 (-20%)
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-mono font-semibold border border-indigo-800/40">
                FLAT500 (-$500)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Value Props */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Atomic Transactions</h4>
              <p className="text-xs text-slate-400 mt-1">
                Zero overselling with MySQL row locks (<code className="text-[11px] font-mono text-indigo-300">select_for_update</code>).
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">RBAC &amp; JWT Auth</h4>
              <p className="text-xs text-slate-400 mt-1">
                Secured Customer &amp; Admin APIs with token blacklist &amp; refresh cycle.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Coupon Engine</h4>
              <p className="text-xs text-slate-400 mt-1">
                Enforces min order, expiration, global limit, and per-user frequency.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-semibold text-sm text-white">Order Tracking &amp; Restock</h4>
              <p className="text-xs text-slate-400 mt-1">
                Visual timeline with automatic inventory restoration upon cancellation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Featured Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Explore curated premium selections
            </p>
          </div>
          <Link
            to="/categories"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-slate-800 border border-slate-800/80 hover:border-indigo-500/50 transition-all shadow-sm hover:shadow-xl hover:shadow-indigo-950/30"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-90"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                <span className="text-white font-bold text-sm sm:text-base group-hover:text-indigo-300 transition-colors">
                  {cat.name}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  {cat.products_count !== undefined ? `${cat.products_count} items` : 'Explore'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Trending Products
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Top customer choices with verified stock levels
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>See Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 border border-indigo-700/40 p-8 sm:p-12 overflow-hidden shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Limited Time Internship Special
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Get Up To 20% Off With Coupon Code
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Use code <strong className="text-white font-mono bg-indigo-950 px-2 py-0.5 rounded border border-indigo-700/50">SAVE20</strong> at checkout on orders over $150 to experience our authoritative backend coupon calculation engine.
            </p>
            <div className="pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-950 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all shadow-lg active:scale-95"
              >
                <span>Shop Qualified Items</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
