'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Mail,
  FileText,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/employees', label: 'Employees', icon: Users },
  { href: '/dashboard/events', label: 'Events', icon: Calendar },
  { href: '/dashboard/email', label: 'Send Emails', icon: Mail, highlight: true },
  { href: '/dashboard/logs', label: 'Email Logs', icon: FileText },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<{ name: string; email: string; role: string } | null>(null);

  useEffect(() => {
    const saved = Cookies.get('admin');
    if (saved) {
      try {
        setAdmin(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col flex-shrink-0 transition-colors duration-200">
      {/* Brand Logo Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm border border-slate-200/80 dark:border-slate-700/80 bg-white flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo-emblem.png"
              alt="AI Automation Email Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm leading-tight tracking-tight">
              AI Automation
            </p>
            <p className="text-xs text-brand-600 dark:text-brand-400 font-medium leading-tight">
              HR Communications
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3.5 py-5 space-y-1.5 overflow-y-auto">
        <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
          Workspace
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${
                active
                  ? 'active'
                  : ''
              } group`}
            >
              <Icon className="w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span className="flex-1">{item.label}</span>
              {item.highlight && !active && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Profile Snippet */}
      <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {admin?.name ? admin.name.slice(0, 2).toUpperCase() : 'AD'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {admin?.name || 'HR Admin'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize truncate">
              {admin?.role || 'Administrator'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
