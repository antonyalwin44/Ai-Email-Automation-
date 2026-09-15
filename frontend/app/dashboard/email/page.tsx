'use client';

import { useEffect, useState } from 'react';
import {
  Calendar, Users, Sparkles, Send, CheckCircle2,
  ChevronRight, RefreshCw, Mail, Edit3, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import api from '@/lib/api';

interface Event {
  id: number;
  event_name: string;
  event_type: string;
  event_date: string;
  event_time: string;
  venue: string;
  description: string;
}

interface Employee {
  id: number;
  full_name: string;
  email: string;
  department: string;
  designation: string;
}

type Step = 1 | 2 | 3 | 4;
type RecipientMode = 'all' | 'department' | 'individual';

const STEPS = [
  { id: 1, label: 'Select Event', icon: Calendar },
  { id: 2, label: 'Choose Recipients', icon: Users },
  { id: 3, label: 'AI Email Preview', icon: Sparkles },
  { id: 4, label: 'Send', icon: Send },
];

export default function EmailPage() {
  const [step, setStep] = useState<Step>(1);
  const [events, setEvents] = useState<Event[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [recipientMode, setRecipientMode] = useState<RecipientMode>('all');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, empsRes] = await Promise.all([
          api.get('/events', { params: { upcoming: 'true' } }),
          api.get('/employees/active'),
        ]);
        setEvents(eventsRes.data.events);
        setEmployees(empsRes.data.employees);
      } catch {
        toast.error('Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const departments = Array.from(new Set(employees.map((e) => e.department))).sort();

  const getRecipients = (): Employee[] => {
    if (recipientMode === 'all') return employees;
    if (recipientMode === 'department') return employees.filter((e) => e.department === selectedDept);
    return employees.filter((e) => selectedIds.includes(e.id));
  };

  const recipients = getRecipients();

  const generateEmail = async () => {
    if (!selectedEvent) return;
    const firstRecipient = recipients[0];
    setIsGenerating(true);
    try {
      const res = await api.post('/email/generate-email', {
        employee_name: firstRecipient?.full_name || 'Team',
        department: selectedDept || 'All Departments',
        event_name: selectedEvent.event_name,
        event_type: selectedEvent.event_type,
        event_date: selectedEvent.event_date,
        event_time: selectedEvent.event_time,
        venue: selectedEvent.venue,
        description: selectedEvent.description,
      });
      setEmailSubject(res.data.subject);
      setEmailBody(res.data.body);
      setStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate email.');
    } finally {
      setIsGenerating(false);
    }
  };

  const sendEmails = async () => {
    if (!selectedEvent || recipients.length === 0) return;
    setIsSending(true);
    try {
      const ids = recipients.map((r) => r.id);
      const res = await api.post('/email/send-email', {
        employee_ids: ids,
        event_id: selectedEvent.id,
        subject: emailSubject,
        body: emailBody,
      });
      setSendResult(res.data.results);
      setStep(4);
      toast.success(res.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send emails.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleEmployee = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const formatTime = (t: string) => new Date(`2000-01-01T${t}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  if (isLoading) return <LoadingSpinner fullPage text="Loading..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-600" /> AI Email Campaign
          </h1>
          <p className="page-subtitle">Generate personalized invitations using Gemini AI and send via Gmail</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isComplete ? 'bg-emerald-500' : isActive ? 'bg-brand-600' : 'bg-slate-100'
                  }`}>
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    )}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${isActive ? 'text-brand-700' : isComplete ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-slate-300 mx-1 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select Event */}
      {step === 1 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-bold text-slate-900">Step 1: Select an Event</h2>
            <p className="text-xs text-slate-500 mt-0.5">Choose the event you want to send invitations for</p>
          </div>
          <div className="card-body">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No upcoming events. <a href="/dashboard/events/create" className="text-brand-600 hover:underline">Create one first.</a></p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedEvent?.id === event.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{event.event_name}</p>
                        <p className="text-xs text-slate-500 mt-1">{event.event_type}</p>
                      </div>
                      {selectedEvent?.id === event.id && (
                        <CheckCircle2 className="w-5 h-5 text-brand-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p>📅 {formatDate(event.event_date)}</p>
                      <p>🕐 {formatTime(event.event_time)}</p>
                      <p>📍 {event.venue}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedEvent && (
              <div className="mt-4 flex justify-end">
                <button onClick={() => setStep(2)} className="btn-primary">
                  Next: Choose Recipients <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Choose Recipients */}
      {step === 2 && (
        <div className="card">
          <div className="card-header">
            <h2 className="font-bold text-slate-900">Step 2: Choose Recipients</h2>
            <p className="text-xs text-slate-500 mt-0.5">Select who will receive the invitation</p>
          </div>
          <div className="card-body space-y-5">
            {/* Mode selector */}
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'all', label: `All Employees (${employees.length})` },
                { value: 'department', label: 'By Department' },
                { value: 'individual', label: 'Select Individual' },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setRecipientMode(mode.value as RecipientMode)}
                  className={recipientMode === mode.value ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Department filter */}
            {recipientMode === 'department' && (
              <div>
                <label className="label">Select Department</label>
                <select className="select max-w-xs" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  <option value="">Choose a department</option>
                  {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}

            {/* Individual selection */}
            {recipientMode === 'individual' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="label mb-0">Select Employees</label>
                  <div className="flex gap-2">
                    <button onClick={() => setSelectedIds(employees.map((e) => e.id))} className="text-xs text-brand-600 hover:underline">Select All</button>
                    <span className="text-slate-300">|</span>
                    <button onClick={() => setSelectedIds([])} className="text-xs text-slate-500 hover:underline">Clear</button>
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
                  {employees.map((emp) => (
                    <label key={emp.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(emp.id)}
                        onChange={() => toggleEmployee(emp.id)}
                        className="w-4 h-4 text-brand-600 rounded"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-900">{emp.full_name}</p>
                        <p className="text-xs text-slate-400">{emp.department} · {emp.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="bg-brand-50 rounded-lg p-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-600 flex-shrink-0" />
              <p className="text-sm text-brand-700 font-medium">
                {recipients.length} employee{recipients.length !== 1 ? 's' : ''} will receive this email
                {recipientMode === 'department' && selectedDept ? ` from ${selectedDept}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary">← Back</button>
              <button
                onClick={generateEmail}
                disabled={recipients.length === 0 || isGenerating || (recipientMode === 'department' && !selectedDept)}
                className="btn-primary"
              >
                {isGenerating ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating with AI...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate AI Email</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: AI Email Preview */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="card">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-600" /> Step 3: AI-Generated Email Preview
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Review and edit the email before sending</p>
              </div>
              <button
                onClick={generateEmail}
                disabled={isGenerating}
                className="btn-secondary btn-sm"
                title="Regenerate"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Subject
                </label>
                <input
                  className="input font-medium"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="label flex items-center gap-2">
                  <Edit3 className="w-4 h-4" /> Email Body
                </label>
                <textarea
                  className="textarea font-mono text-sm"
                  rows={14}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                />
              </div>

              {/* Recipients summary */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">📬 Sending to {recipients.length} recipients:</p>
                <div className="flex flex-wrap gap-2">
                  {recipients.slice(0, 8).map((r) => (
                    <span key={r.id} className="badge badge-blue">{r.full_name}</span>
                  ))}
                  {recipients.length > 8 && (
                    <span className="badge badge-gray">+{recipients.length - 8} more</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setStep(2)} className="btn-secondary">← Back</button>
                <button
                  onClick={sendEmails}
                  disabled={isSending || !emailSubject || !emailBody}
                  className="btn-success"
                >
                  {isSending ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending {recipients.length} emails...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send to {recipients.length} Recipients</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && sendResult && (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Emails Sent!</h2>
            <p className="text-slate-500 mt-2 mb-8">Your campaign has been processed successfully.</p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-emerald-600">{sendResult.sent}</p>
                <p className="text-sm text-slate-500 mt-1">Successfully Sent</p>
              </div>
              {sendResult.failed > 0 && (
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600">{sendResult.failed}</p>
                  <p className="text-sm text-slate-500 mt-1">Failed</p>
                </div>
              )}
            </div>

            {sendResult.failed > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-left max-w-sm mx-auto mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-700">Some emails failed. Check email logs for details.</p>
              </div>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setStep(1); setSelectedEvent(null); setSendResult(null); setEmailBody(''); setEmailSubject(''); }}
                className="btn-primary"
              >
                <Mail className="w-4 h-4" /> Send Another Campaign
              </button>
              <a href="/dashboard/logs" className="btn-secondary">View Email Logs</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
