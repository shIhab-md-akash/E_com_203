import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const { register, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    if (formData.password !== formData.password_confirm) {
      setFieldErrors({ password_confirm: ['Passwords do not match.'] });
      return;
    }

    setSubmitting(true);
    try {
      await register(formData);
      showToast('Account registered successfully! Signing you in...', 'success');
      await login(formData.username, formData.password);
      navigate('/products');
    } catch (err: any) {
      if (err.response?.data) {
        setFieldErrors(err.response.data);
      } else {
        showToast('Registration failed. Please check your data.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-14 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Create Customer Account
        </h1>
        <p className="text-xs text-slate-400">
          Enforces password strength &amp; unique username/email in MySQL
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl text-xs">
        {/* Username */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-300">Username *</label>
          <input
            type="text"
            required
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
          {fieldErrors.username && (
            <p className="text-rose-400 text-[11px]">{fieldErrors.username[0]}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-300">Email Address *</label>
          <input
            type="email"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
          {fieldErrors.email && (
            <p className="text-rose-400 text-[11px]">{fieldErrors.email[0]}</p>
          )}
        </div>

        {/* Names */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block font-semibold text-slate-300">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
          <div className="space-y-1">
            <label className="block font-semibold text-slate-300">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-300">Phone</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
        </div>

        {/* Passwords */}
        <div className="space-y-1">
          <label className="block font-semibold text-slate-300">Password (min 6 chars) *</label>
          <input
            type="password"
            required
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
          {fieldErrors.password && (
            <p className="text-rose-400 text-[11px]">{fieldErrors.password[0]}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-slate-300">Confirm Password *</label>
          <input
            type="password"
            required
            name="password_confirm"
            value={formData.password_confirm}
            onChange={handleChange}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
          />
          {fieldErrors.password_confirm && (
            <p className="text-rose-400 text-[11px]">{fieldErrors.password_confirm[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-40"
        >
          {submitting ? 'Creating Account...' : 'Register Account'}
        </button>

        <div className="pt-2 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </form>
    </div>
  );
};
