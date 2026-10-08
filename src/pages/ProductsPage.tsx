import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  PackageOpen,
} from 'lucide-react';
import api from '../services/api';
import { Product, Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination state
  const [count, setCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter states
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const inStock = searchParams.get('in_stock') === 'true';

  const [searchInput, setSearchInput] = useState(search);
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // Fetch categories once
  useEffect(() => {
    api.get('/api/categories/')
      .then((res) => setCategories(res.data?.results || res.data || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch products whenever params change
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const page = searchParams.get('page') || '1';
      const params = new URLSearchParams(searchParams);
      params.set('page_size', '12');

      const res = await api.get(`/api/products/?${params.toString()}`);
      setProducts(res.data.results || []);
      setCount(res.data.count || 0);
      setTotalPages(res.data.total_pages || 1);
      setCurrentPage(Number(page));
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update query params helper
  const updateFilter = (key: string, value: string | boolean | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === false) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, String(value));
    }
    nextParams.set('page', '1'); // reset page on filter
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const handlePriceApply = () => {
    const nextParams = new URLSearchParams(searchParams);
    if (minInput) nextParams.set('min_price', minInput);
    else nextParams.delete('min_price');

    if (maxInput) nextParams.set('max_price', maxInput);
    else nextParams.delete('max_price');

    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setMinInput('');
    setMaxInput('');
    setSearchParams({});
  };

  const changePage = (newPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Filter Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Product Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Showing <strong className="text-white">{count}</strong> verified items in MySQL database
          </p>
        </div>

        {/* Controls: Search, Sort, Mobile Filter Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by name, brand, SKU..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>

          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Most Popular</option>
          </select>

          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className={`lg:block ${filterDrawerOpen ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" />
                Filters
              </span>
              <button
                onClick={resetAllFilters}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Category
              </h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => updateFilter('category', null)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    !selectedCategory ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>All Categories</span>
                  <span>{count}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => updateFilter('category', c.slug)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === c.slug
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span>{c.products_count ?? ''}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
                Price Range ($)
              </h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minInput}
                  onChange={(e) => setMinInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                />
                <span className="text-slate-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxInput}
                  onChange={(e) => setMaxInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                />
              </div>
              <button
                onClick={handlePriceApply}
                className="mt-2 w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                Apply Price
              </button>
            </div>

            {/* Stock Availability */}
            <div className="pt-2 border-t border-slate-800">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateFilter('in_stock', e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-80 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <PackageOpen className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="font-bold text-lg text-white">No products found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No products match your current search or filter criteria. Try resetting filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 text-xs text-slate-400">
              <div>
                Page <strong className="text-white">{currentPage}</strong> of{' '}
                <strong className="text-white">{totalPages}</strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, idx) => {
                    const p = idx + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => changePage(p)}
                        className={`w-8 h-8 rounded-lg font-semibold transition-colors ${
                          currentPage === p
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-white"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
