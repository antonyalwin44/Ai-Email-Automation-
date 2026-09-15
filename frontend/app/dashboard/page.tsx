'use client';

import { useEffect, useState } from 'react';
import { Users, Calendar, Mail, AlertCircle, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Cookies from 'js-cookie';
import StatCard from '@/components/StatCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import api from '@/lib/api';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalEvents: number;
  upcomingEvents: number;
  emailsSent: number;
  emailsPending: number;
  emailsFailed: number;
}

interface RecentLog {
  id: number;
  employee_name: string;
  event_name: string;
  email_subject: string;
  status: string;
  sent_time: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const savedAdmin = Cookies.get('admin');
    if (savedAdmin) {
      try { setAdmin(JSON.parse(savedAdmin)); } catch {}
    }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get('/logs/dashboard-stats'),
        api.get('/logs?limit=5'),
      ]);
      setStats(statsRes.data.stats);
      setRecentLogs(logsRes.data.logs || []);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullPage text="Loading dashboard..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {admin?.name || 'Admin'}! 👋</h1>
            <p className="text-brand-200 mt-1 text-sm">Here's what's happening with your HR operations today.</p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          subtitle={`${stats?.activeEmployees || 0} active`}
          icon={<Users className="w-7 h-7 text-blue-600" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Upcoming Events"
          value={stats?.upcomingEvents || 0}
          subtitle={`${stats?.totalEvents || 0} total events`}
          icon={<Calendar className="w-7 h-7 text-purple-600" />}
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Emails Sent"
          value={stats?.emailsSent || 0}
          subtitle="Successfully delivered"
          icon={<Mail className="w-7 h-7 text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Pending Emails"
          value={stats?.emailsPending || 0}
          subtitle="Awaiting delivery"
          icon={<Clock className="w-7 h-7 text-amber-600" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Failed Emails"
          value={stats?.emailsFailed || 0}
          subtitle="Delivery failed"
          icon={<AlertCircle className="w-7 h-7 text-red-600" />}
          iconBg="bg-red-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/employees/add', label: 'Add New Employee', desc: 'Register a new team member', icon: Users, color: 'bg-blue-500' },
          { href: '/dashboard/events/create', label: 'Create Event', desc: 'Schedule a company event', icon: Calendar, color: 'bg-purple-500' },
          { href: '/dashboard/email', label: 'Send Invitations', desc: 'Generate & send AI emails', icon: Mail, color: 'bg-emerald-500' },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">{action.label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Email Activity */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">Recent Email Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest email sending records</p>
          </div>
          <Link href="/dashboard/logs" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="card-body p-0">
          {recentLogs.length === 0 ? (
            <div className="py-12 text-center">
              <Mail className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No emails sent yet.</p>
              <Link href="/dashboard/email" className="text-brand-600 text-sm font-medium hover:underline mt-1 inline-block">
                Send your first invitation →
              </Link>
            </div>
          ) : (
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Event</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="font-medium">{log.employee_name || 'N/A'}</td>
                      <td>{log.event_name || 'N/A'}</td>
                      <td className="max-w-xs truncate text-slate-500 text-xs">{log.email_subject}</td>
                      <td><StatusBadge status={log.status} /></td>
                      <td className="text-xs text-slate-400">
                        {log.sent_time ? new Date(log.sent_time).toLocaleString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
