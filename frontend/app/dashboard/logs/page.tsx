'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface EmailLog {
  id: number;
  employee_name: string;
  department: string;
  event_name: string;
  event_type: string;
  email_subject: string;
  recipient_email: string;
  status: string;
  sent_time: string;
  error_message: string;
}

interface LogStats {
  total: number;
  sent: number;
  pending: number;
  failed: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<LogStats>({ total: 0, sent: 0, pending: 0, failed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/logs', { params: { status: statusFilter, page, limit: 15 } });
      setLogs(res.data.logs);
      setStats(res.data.stats);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch {
      toast.error('Failed to load email logs.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const formatDateTime = (dt: string) =>
    dt ? new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Email Logs</h1>
          <p className="page-subtitle">{total} total email records</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'text-slate-900', bg: 'bg-slate-50' },
          { label: 'Sent', value: stats.sent, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-700', bg: 'bg-amber-50' },
          { label: 'Failed', value: stats.failed, color: 'text-red-700', bg: 'bg-red-50' },
        ].map((s) => (
          <div key={s.label} className={`card p-5 ${s.bg}`}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="card p-4">
        <div className="flex gap-3 items-center">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Filter by status:</span>
          {['', 'Sent', 'Pending', 'Failed'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <div className="py-16 flex justify-center"><LoadingSpinner text="Loading logs..." /></div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No email logs found.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Employee</th>
                    <th>Event</th>
                    <th>Subject</th>
                    <th>Recipient</th>
                    <th>Status</th>
                    <th>Sent At</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-slate-400 font-mono text-xs">{log.id}</td>
                      <td>
                        <p className="font-medium text-slate-900">{log.employee_name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{log.department || ''}</p>
                      </td>
                      <td>
                        <p className="font-medium">{log.event_name || 'N/A'}</p>
                        <p className="text-xs text-slate-400">{log.event_type || ''}</p>
                      </td>
                      <td>
                        <p className="max-w-xs truncate text-slate-600 text-xs">{log.email_subject}</p>
                      </td>
                      <td className="text-xs text-slate-500 font-mono">{log.recipient_email}</td>
                      <td>
                        <StatusBadge status={log.status} />
                        {log.status === 'Failed' && log.error_message && (
                          <p className="text-xs text-red-500 mt-1 max-w-xs truncate" title={log.error_message}>
                            {log.error_message}
                          </p>
                        )}
                      </td>
                      <td className="text-xs text-slate-400 whitespace-nowrap">{formatDateTime(log.sent_time)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary btn-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary btn-sm">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
