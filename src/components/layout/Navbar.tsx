import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  ShieldCheck,
  Package,
  LogOut,
  FileText,
  Layers,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, login } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleDemoLogin = async (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      await login('admin', 'AdminPassword123!');
    } else {
      await login('john_doe', 'CustomerPassword123!');
    }
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className="flex items-center gap-1.5 font-display text-lg tracking-normal">
              Apex<span className="text-indigo-400">Store</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                MySQL 8
              </span>
            </span>
          </Link>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <input
              type="text"
              placeholder="Search products, brands, SKUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link
              to="/products"
              className={`hover:text-white transition-colors ${
                location.pathname === '/products' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Shop All
            </Link>
            <Link
              to="/categories"
              className={`hover:text-white transition-colors ${
                location.pathname === '/categories' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              Categories
            </Link>
            <Link
              to="/docs"
              className={`flex items-center gap-1.5 hover:text-white transition-colors ${
                location.pathname === '/docs' ? 'text-indigo-400 font-semibold' : ''
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Docs &amp; Architecture
            </Link>
          </nav>

          {/* User & Actions */}
          <div className="flex items-center gap-3">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2 text-slate-300 hover:text-rose-400 hover:bg-slate-800/60 rounded-xl transition-all"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-300 hover:text-indigo-400 hover:bg-slate-800/60 rounded-xl transition-all"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scale-in">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-sm font-medium text-slate-200 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold uppercase">
                      {user?.username?.[0] || 'U'}
                    </div>
                    <span className="max-w-[100px] truncate">{user?.first_name || user?.username}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 text-sm z-50 animate-fade-in"
                      onMouseLeave={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2.5 border-b border-slate-800">
                        <div className="font-semibold text-white truncate">{user?.username}</div>
                        <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                          {user?.role === 'ADMIN' ? 'Administrator' : 'Customer'}
                        </div>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-indigo-400 hover:bg-slate-800/80 font-medium transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Admin Console
                        </Link>
                      )}

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                      >
                        <Layers className="w-4 h-4 text-slate-400" />
                        My Dashboard
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        Order History
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile Settings
                      </Link>

                      <div className="border-t border-slate-800 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 font-medium transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex px-3.5 py-1.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Register
                  </Link>

                  {/* One-Click Demo Switcher */}
                  <div className="relative">
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Quick Demo Accounts"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden md:inline">Demo</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {userDropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-48 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 text-xs"
                        onMouseLeave={() => setUserDropdownOpen(false)}
                      >
                        <div className="font-semibold text-slate-400 px-2 py-1 uppercase text-[10px] tracking-wider">
                          One-Click Login
                        </div>
                        <button
                          onClick={() => handleDemoLogin('admin')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 hover:text-white"
                        >
                          <span>Admin Portal</span>
                          <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">ADMIN</span>
                        </button>
                        <button
                          onClick={() => handleDemoLogin('customer')}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center justify-between text-slate-200 hover:text-white"
                        >
                          <span>John Doe</span>
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">CUSTOMER</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="grid grid-cols-2 gap-2 pt-2 text-sm">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-center font-medium"
              >
                All Products
              </Link>
              <Link
                to="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-center font-medium"
              >
                Categories
              </Link>
              <Link
                to="/docs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-center font-medium"
              >
                Documentation
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg bg-slate-800 text-slate-200 text-center font-medium"
              >
                My Orders
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
