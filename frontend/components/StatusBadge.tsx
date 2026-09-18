'use client';

type StatusType = 'Sent' | 'Pending' | 'Failed' | 'Active' | 'Inactive' | string;

interface StatusBadgeProps {
  status: StatusType;
}

const statusConfig: Record<string, { label: string; className: string; dotClass: string }> = {
  Sent: {
    label: 'Delivered',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    dotClass: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  },
  Pending: {
    label: 'Pending',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    dotClass: 'bg-amber-500 animate-ping',
  },
  Failed: {
    label: 'Failed',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    dotClass: 'bg-rose-500',
  },
  Active: {
    label: 'Active',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    dotClass: 'bg-emerald-500',
  },
  Inactive: {
    label: 'Inactive',
    className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
    dotClass: 'bg-slate-400',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20',
    dotClass: 'bg-slate-400',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {config.label}
    </span>
  );
}
