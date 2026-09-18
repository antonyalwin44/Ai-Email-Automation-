'use client';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg?: string;
  badge?: {
    text: string;
    type: 'success' | 'info' | 'warning' | 'neutral' | 'danger';
  };
  progress?: number; // 0 to 100
  accentColor?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  badge,
  progress,
  accentColor = 'from-brand-500 to-indigo-600',
}: StatCardProps) {
  const badgeStyles = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    neutral: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-lg hover:border-brand-500/30 dark:hover:border-brand-500/30 transition-all duration-300 hover:-translate-y-0.5">
      {/* Subtle top ambient glow on hover */}
      <div
        className={`absolute inset-x-0 -top-px h-0.5 bg-gradient-to-r ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Header: Title + Icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300 shadow-sm">
          {icon}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
              badgeStyles[badge.type] || badgeStyles.neutral
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>

      {/* Progress Bar (Optional) */}
      {typeof progress === 'number' && (
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${accentColor} rounded-full transition-all duration-500`}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
      )}

      {/* Subtitle / Context */}
      {subtitle && (
        <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
}
