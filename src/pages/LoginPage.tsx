import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/products';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const user = await login(username.trim(), password);
      showToast(`Welcome back, ${user.first_name || user.username}!`, 'success');
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid username or password.';
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setSubmitting(true);
    setErrorMsg('');
    try {
      const user = await login(u, p);
      showToast(`Logged in as ${user.username}`, 'success');
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err: any) {
      showToast('Quick login failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Sign In to ApexStore
        </h1>
        <p className="text-xs text-slate-400">
          Secure JWT Authentication &bull; Role-Based Access Control (RBAC)
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Username</label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="e.g. admin or john_doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-300">Password</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-40"
        >
          {submitting ? 'Verifying with Backend...' : 'Sign In'}
        </button>

        <div className="pt-2 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline font-semibold">
            Create an account
          </Link>
        </div>
      </form>

      {/* Quick Demo Credentials Panel */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Quick Demo Logins (Internship Evaluation)</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('admin', 'AdminPassword123!')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all group"
          >
            <div className="font-bold text-white group-hover:text-indigo-400">Admin Account</div>
            <div className="text-[10px] text-slate-400 font-mono">admin / AdminPassword123!</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('john_doe', 'CustomerPassword123!')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all group"
          >
            <div className="font-bold text-white group-hover:text-indigo-400">Customer 1</div>
            <div className="text-[10px] text-slate-400 font-mono">john_doe / Customer...</div>
          </button>
        </div>
      </div>
    </div>
  );
};
