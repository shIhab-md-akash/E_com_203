import React from 'react';

interface BadgeProps {
  status: string;
  type?: 'order' | 'payment' | 'role' | 'stock';
}

export const Badge: React.FC<BadgeProps> = ({ status, type = 'order' }) => {
  const getBadgeStyle = () => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
      case 'PAID':
      case 'SUCCESS':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'CONFIRMED':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CANCELLED':
      case 'FAILED':
      case 'REFUNDED':
      case 'OUT_OF_STOCK':
      case 'INACTIVE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'ADMIN':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'CUSTOMER':
        return 'bg-slate-500/10 text-slate-300 border-slate-600/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${getBadgeStyle()}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};
