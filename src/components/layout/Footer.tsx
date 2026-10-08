import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Database, ShieldCheck, Code, BookOpen, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Stack Info */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span>ApexStore</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Internship portfolio project showcasing production-grade Full-Stack E-Commerce &amp; Order Management.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                Django 5
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                MySQL 8
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                React 19
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                JWT RBAC
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Explore Store
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">
                  Product Categories
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white transition-colors">
                  Shopping Cart &amp; Coupons
                </Link>
              </li>
              <li>
                <Link to="/orders/track" className="hover:text-white transition-colors">
                  Track Order By ID
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Architecture & Docs */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Documentation &amp; Specs
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/docs" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  MySQL ER Diagram
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  System Architecture
                </Link>
              </li>
              <li>
                <a
                  href="/api/docs/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-1.5 transition-colors text-indigo-400 hover:underline"
                >
                  <Code className="w-3.5 h-3.5" />
                  OpenAPI / Swagger UI
                </a>
              </li>
              <li>
                <Link to="/docs" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                  Internship Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Demo Credentials */}
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Demo Credentials
            </h4>
            <div className="text-[11px] space-y-1.5 text-slate-300 font-mono">
              <div>
                <span className="text-indigo-400 font-semibold">Admin:</span> admin / AdminPassword123!
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Customer 1:</span> john_doe / CustomerPassword123!
              </div>
              <div>
                <span className="text-slate-400 font-semibold">Customer 2:</span> jane_smith / CustomerPassword123!
              </div>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 leading-tight">
              Active test coupons: <span className="text-amber-300 font-mono font-bold">WELCOME10</span>, <span className="text-amber-300 font-mono font-bold">SAVE20</span>, <span className="text-amber-300 font-mono font-bold">FLAT500</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            &copy; {new Date().getFullYear()} ApexStore Platform. Engineered with Django REST Framework &amp; MySQL 8.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>InnoDB Transactions</span>
            <span>&bull;</span>
            <span>Row Locking (SELECT FOR UPDATE)</span>
            <span>&bull;</span>
            <span>Zero-Oversell Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
