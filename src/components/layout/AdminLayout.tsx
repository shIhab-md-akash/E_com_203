import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingBag,
  Users,
  Tag,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Categories', path: '/admin/categories', icon: Layers },
    { label: 'Inventory & Logs', path: '/admin/inventory', icon: Boxes },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Coupons', path: '/admin/coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-4 space-y-6 shrink-0">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-white">Admin Console</div>
              <div className="text-[10px] text-slate-400 font-mono">RBAC: {user?.role}</div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1 text-xs font-medium">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2 text-xs">
          <Link
            to="/products"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Storefront View</span>
          </Link>

          <a
            href="/api/docs/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors font-mono"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Swagger API Docs</span>
          </a>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
};
