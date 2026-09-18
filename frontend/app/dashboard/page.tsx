'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Calendar,
  Mail,
  AlertCircle,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Send,
  Search,
  Building2,
  MapPin,
  ChevronRight,
} from 'lucide-react';
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
  department?: string;
  event_name: string;
  event_type?: string;
  email_subject: string;
  status: string;
  sent_time: string;
}

interface UpcomingEvent {
  id: number;
  event_name: string;
  event_type: string;
  event_date: string;
  event_time: string;
  venue: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Sent' | 'Pending' | 'Failed'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<{ name: string; email?: string } | null>(null);

  useEffect(() => {
    const savedAdmin = Cookies.get('admin');
    if (savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch {}
    }
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, logsRes, eventsRes] = await Promise.all([
        api.get('/logs/dashboard-stats'),
        api.get('/logs?limit=8'),
        api.get('/events?upcoming=true'),
      ]);
      const raw = statsRes.data.stats;
      setStats({
        totalEmployees: Number(raw?.totalEmployees) || 0,
        activeEmployees: Number(raw?.activeEmployees) || 0,
        totalEvents: Number(raw?.totalEvents) || 0,
        upcomingEvents: Number(raw?.upcomingEvents) || 0,
        emailsSent: Number(raw?.emailsSent) || 0,
        emailsPending: Number(raw?.emailsPending) || 0,
        emailsFailed: Number(raw?.emailsFailed) || 0,
      });
      setRecentLogs(logsRes.data.logs || []);
      setUpcomingEvents(eventsRes.data.events?.slice(0, 4) || []);
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return recentLogs.filter((log) => {
      const matchesFilter = activeFilter === 'All' ? true : log.status === activeFilter;
      const matchesSearch =
        searchQuery.trim() === '' ||
        (log.employee_name && log.employee_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.event_name && log.event_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (log.email_subject && log.email_subject.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [recentLogs, activeFilter, searchQuery]);

  // Compute avatar initials & color
  const getAvatarInfo = (name: string) => {
    const clean = (name || 'Employee').trim();
    const parts = clean.split(' ');
    const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : clean.slice(0, 2).toUpperCase();
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-blue-600',
    ];
    const index = Math.abs(clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
    return { initials, gradient: colors[index] };
  };

  // Delivery rate calculation
  const totalEmails = (stats?.emailsSent || 0) + (stats?.emailsPending || 0) + (stats?.emailsFailed || 0);
  const deliveryRate = totalEmails > 0 ? Math.round(((stats?.emailsSent || 0) / totalEmails) * 100) : 100;
  const activeEmpRatio = stats?.totalEmployees ? Math.round(((stats.activeEmployees || 0) / stats.totalEmployees) * 100) : 100;

  if (isLoading) return <LoadingSpinner fullPage text="Preparing your HR command center..." />;

  return (
    <div className="space-y-7 animate-fade-in max-w-[1600px] mx-auto pb-10">
      {/* ─── Hero Welcome Banner ─────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-950 to-indigo-950 text-white p-7 sm:p-9 shadow-xl border border-slate-800/80">
        {/* Background glow orbs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {greeting}, {admin?.name || 'HR Admin'}! 👋
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
              Your AI-powered HR communications are running smoothly. Review team metrics, craft personalized event invitations, or schedule your next company event.
            </p>
          </div>

          {/* Quick Hero Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Link
              href="/dashboard/email"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-lg shadow-brand-500/30 hover:shadow-brand-500/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Send AI Invitations</span>
            </Link>
            <Link
              href="/dashboard/events/create"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-sm backdrop-blur-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4 text-brand-300" />
              <span>New Event</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Modern Key Performance Indicators (KPIs) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Team"
          value={stats?.totalEmployees || 0}
          subtitle={`${stats?.activeEmployees || 0} Active Employees`}
          icon={<Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          badge={{ text: `${activeEmpRatio}% Active`, type: 'success' }}
          progress={activeEmpRatio}
          accentColor="from-blue-500 to-indigo-600"
        />

        <StatCard
          title="Upcoming Events"
          value={stats?.upcomingEvents || 0}
          subtitle={`${stats?.totalEvents || 0} Total Events Scheduled`}
          icon={<Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          badge={{ text: 'Active Calendar', type: 'info' }}
          progress={stats?.totalEvents ? Math.min(100, Math.round(((stats.upcomingEvents || 0) / stats.totalEvents) * 100)) : 100}
          accentColor="from-purple-500 to-pink-600"
        />

        <StatCard
          title="Delivered Emails"
          value={stats?.emailsSent || 0}
          subtitle="Successfully delivered to inboxes"
          icon={<Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          badge={{ text: `${deliveryRate}% Success`, type: 'success' }}
          progress={deliveryRate}
          accentColor="from-emerald-500 to-teal-600"
        />

        <StatCard
          title="Delivery Queue"
          value={stats?.emailsPending || 0}
          subtitle={(stats?.emailsFailed || 0) > 0 ? `${stats?.emailsFailed} Failed deliveries` : 'Zero errors in sending queue'}
          icon={<Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          badge={{
            text: (stats?.emailsFailed || 0) > 0 ? 'Needs Review' : 'All Clear',
            type: (stats?.emailsFailed || 0) > 0 ? 'danger' : 'success',
          }}
          progress={(stats?.emailsFailed || 0) > 0 ? 30 : 100}
          accentColor="from-amber-500 to-orange-500"
        />
      </div>

      {/* ─── Interactive Quick Shortcuts ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {[
          {
            href: '/dashboard/employees/add',
            title: 'Add New Employee',
            desc: 'Register team members and assign departments',
            icon: Users,
            gradient: 'from-blue-500 to-indigo-600',
            bgLight: 'group-hover:bg-blue-500/5',
          },
          {
            href: '/dashboard/events/create',
            title: 'Schedule Company Event',
            desc: 'Create workshops, festivals, or annual days',
            icon: Calendar,
            gradient: 'from-purple-500 to-pink-600',
            bgLight: 'group-hover:bg-purple-500/5',
          },
          {
            href: '/dashboard/email',
            title: 'AI Email Campaign',
            desc: 'Craft personalized invitations using Gemini/Ollama',
            icon: Sparkles,
            gradient: 'from-emerald-500 to-teal-600',
            bgLight: 'group-hover:bg-emerald-500/5',
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-brand-500/30 ${item.bgLight}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0 text-white shadow-md shadow-brand-500/10 group-hover:scale-105 transition-transform duration-300`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 dark:text-white text-sm tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {item.title}
                    </p>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── Two-Column Section: Activity & Sidebar Widgets ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Email Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm overflow-hidden">
            {/* Table Header Controls */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Recent Email Activity
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Latest automated invitations sent to team members
                </p>
              </div>

              {/* Filter Tabs & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-36 sm:w-44 transition-all"
                  />
                </div>

                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  {(['All', 'Sent', 'Pending', 'Failed'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                        activeFilter === filter
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Body */}
            {filteredLogs.length === 0 ? (
              <div className="py-16 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {searchQuery ? 'No matching email records' : 'No email activity found'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery
                    ? `No logs matching "${searchQuery}". Try clearing your search.`
                    : 'Personalized event invitations will appear here automatically after generation.'}
                </p>
                <div className="mt-4">
                  <Link href="/dashboard/email" className="btn-primary text-xs py-2 px-4">
                    <Send className="w-3.5 h-3.5" />
                    Send An Invitation
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Event</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Sent At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => {
                      const avatar = getAvatarInfo(log.employee_name);
                      return (
                        <tr key={log.id} className="group">
                          {/* Employee Name with Avatar */}
                          <td>
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatar.gradient} text-white flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0`}
                              >
                                {avatar.initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white text-xs leading-tight truncate">
                                  {log.employee_name || 'Team Member'}
                                </p>
                                {log.department && (
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3 h-3" />
                                    {log.department}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Event Name */}
                          <td>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                              <Calendar className="w-3.5 h-3.5 text-brand-500 flex-shrink-0" />
                              <span className="truncate max-w-[140px]">{log.event_name || 'Company Event'}</span>
                            </div>
                          </td>

                          {/* Subject */}
                          <td>
                            <p
                              className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[200px]"
                              title={log.email_subject}
                            >
                              {log.email_subject || 'Event Invitation'}
                            </p>
                          </td>

                          {/* Status */}
                          <td>
                            <StatusBadge status={log.status} />
                          </td>

                          {/* Sent Time */}
                          <td className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
                            {log.sent_time ? (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {new Date(log.sent_time).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  day: 'numeric',
                                })}
                                ,{' '}
                                {new Date(log.sent_time).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer View All Link */}
            <div className="px-5 py-3.5 bg-slate-50/50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Showing {filteredLogs.length} of {recentLogs.length} recent records
              </span>
              <Link
                href="/dashboard/logs"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 group"
              >
                <span>Full Audit Logs</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Column (1/3): Upcoming Events & AI Assistant */}
        <div className="space-y-6">
          {/* Upcoming Events Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                  Upcoming Events
                </h3>
              </div>
              <Link
                href="/dashboard/events"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-2">
              {upcomingEvents.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">No upcoming events scheduled.</p>
                  <Link href="/dashboard/events/create" className="text-xs text-brand-600 font-semibold mt-1 inline-block">
                    + Schedule an event
                  </Link>
                </div>
              ) : (
                upcomingEvents.map((event) => {
                  const dateObj = new Date(event.event_date);
                  const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                  const day = dateObj.getDate();
                  return (
                    <div key={event.id} className="py-3.5 flex items-start gap-3.5 group">
                      {/* Date Block */}
                      <div className="w-11 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/50 border border-brand-100/80 dark:border-slate-700/80 flex flex-col items-center justify-center flex-shrink-0 group-hover:border-brand-500/40 transition-colors">
                        <span className="text-[10px] font-extrabold text-brand-600 dark:text-brand-400 uppercase leading-none">
                          {month}
                        </span>
                        <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
                          {day}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-slate-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {event.event_name}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {event.venue}
                          </span>
                          <span>•</span>
                          <span className="text-purple-600 dark:text-purple-400 font-medium">
                            {event.event_type}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/dashboard/email?eventId=${event.id}`}
                        title="Send Invitations"
                        className="p-2 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
