'use client';

import { LogOut, Bell, ChevronDown, User, CheckCircle2, AlertCircle, Mail, Sparkles, X, Sun, Moon } from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: 'success' | 'info' | 'error';
}

export default function TopNav() {
  const router = useRouter();
  const [admin, setAdmin] = useState<{ name: string; email: string; role: string } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Ollama AI Engine Connected',
      desc: 'Local Llama 3 model is active and ready for generation.',
      time: 'Just now',
      type: 'info',
    },
    {
      id: '2',
      title: 'Gmail SMTP Verified',
      desc: 'Email sending configured with antonyalwin2003@gmail.com',
      time: '5m ago',
      type: 'success',
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check saved theme
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    const savedAdmin = Cookies.get('admin');
    if (savedAdmin) {
      try { setAdmin(JSON.parse(savedAdmin)); } catch {}
    }

    // Fetch latest email logs to populate notifications
    const fetchRecentLogs = async () => {
      try {
        const res = await api.get('/logs?limit=3');
        if (res.data?.logs && res.data.logs.length > 0) {
          const logItems: NotificationItem[] = res.data.logs.map((log: any) => ({
            id: `log-${log.id}`,
            title: log.status === 'Sent' ? `Email Sent to ${log.recipient_email}` : `Delivery Issue (${log.recipient_email})`,
            desc: log.event_name ? `Event: ${log.event_name}` : (log.email_subject || 'Email notification'),
            time: log.sent_time ? new Date(log.sent_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            type: log.status === 'Sent' ? 'success' : 'error',
          }));
          setNotifications((prev) => [...logItems, ...prev].slice(0, 5));
          setUnreadCount(logItems.length + 1);
        }
      } catch {
        // Fallback to default notifications
      }
    };

    fetchRecentLogs();
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
      toast.success('Switched to Light Mode', { icon: '☀️' });
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
      toast.success('Switched to Dark Mode', { icon: '🌙' });
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('admin');
    toast.success('Logged out successfully!');
    setTimeout(() => router.push('/login'), 500);
  };

  const handleClearNotifications = () => {
    setUnreadCount(0);
    toast.success('All notifications marked as read');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-20 transition-colors duration-200">
      {/* Left: Page context */}
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              setNotifOpen(!notifOpen);
              setDropdownOpen(false);
            }}
            aria-label="Notifications"
            className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            )}
          </button>

          {/* Notifications Popover */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-fade-in overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleClearNotifications}
                    className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
                  >
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {item.type === 'success' && (
                          <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === 'error' && (
                          <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4" />
                          </div>
                        )}
                        {item.type === 'info' && (
                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">{item.title}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.desc}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-center">
                <button
                  onClick={() => {
                    setNotifOpen(false);
                    router.push('/dashboard/logs');
                  }}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-semibold py-1 block w-full"
                >
                  View All Email Activity →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-tight capitalize">{admin?.role || 'admin'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg z-50 animate-fade-in">
              <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{admin?.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{admin?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
