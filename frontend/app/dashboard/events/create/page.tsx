'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, CalendarPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const EVENT_TYPES = ['Annual Day', 'Birthday', 'Meeting', 'Workshop', 'Festival', 'Training', 'Sports Day'];

interface FormData {
  event_name: string;
  event_type: string;
  event_date: string;
  event_time: string;
  venue: string;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    event_name: '', event_type: '', event_date: '', event_time: '', venue: '', description: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.event_name.trim()) newErrors.event_name = 'Event name is required';
    if (!formData.event_type) newErrors.event_type = 'Event type is required';
    if (!formData.event_date) newErrors.event_date = 'Event date is required';
    if (!formData.event_time) newErrors.event_time = 'Event time is required';
    if (!formData.venue.trim()) newErrors.venue = 'Venue is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await api.post('/events', formData);
      toast.success('Event created successfully!');
      router.push('/dashboard/events');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create event.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="page-header">
        <div>
          <Link href="/dashboard/events" className="text-sm text-brand-600 hover:underline flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Events
          </Link>
          <h1 className="page-title">Create New Event</h1>
          <p className="page-subtitle">Schedule a company event and send invitations</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center gap-3">
          <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
            <CalendarPlus className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="font-semibold text-slate-900">Event Details</h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Event Name <span className="text-red-500">*</span></label>
              <input
                name="event_name"
                className={`input ${errors.event_name ? 'input-error' : ''}`}
                placeholder="e.g., Annual Team Celebration"
                value={formData.event_name}
                onChange={handleChange}
              />
              {errors.event_name && <p className="text-red-500 text-xs mt-1">{errors.event_name}</p>}
            </div>

            <div>
              <label className="label">Event Type <span className="text-red-500">*</span></label>
              <select
                name="event_type"
                className={`select ${errors.event_type ? 'input-error' : ''}`}
                value={formData.event_type}
                onChange={handleChange}
              >
                <option value="">Select Event Type</option>
                {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.event_type && <p className="text-red-500 text-xs mt-1">{errors.event_type}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Event Date <span className="text-red-500">*</span></label>
                <input
                  name="event_date"
                  type="date"
                  className={`input ${errors.event_date ? 'input-error' : ''}`}
                  value={formData.event_date}
                  onChange={handleChange}
                />
                {errors.event_date && <p className="text-red-500 text-xs mt-1">{errors.event_date}</p>}
              </div>
              <div>
                <label className="label">Event Time <span className="text-red-500">*</span></label>
                <input
                  name="event_time"
                  type="time"
                  className={`input ${errors.event_time ? 'input-error' : ''}`}
                  value={formData.event_time}
                  onChange={handleChange}
                />
                {errors.event_time && <p className="text-red-500 text-xs mt-1">{errors.event_time}</p>}
              </div>
            </div>

            <div>
              <label className="label">Venue <span className="text-red-500">*</span></label>
              <input
                name="venue"
                className={`input ${errors.venue ? 'input-error' : ''}`}
                placeholder="e.g., Company Auditorium, Conference Hall A"
                value={formData.venue}
                onChange={handleChange}
              />
              {errors.venue && <p className="text-red-500 text-xs mt-1">{errors.venue}</p>}
            </div>

            <div>
              <label className="label">Description</label>
              <textarea
                name="description"
                className="textarea"
                rows={4}
                placeholder="Brief description of the event..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                ) : (
                  <><Save className="w-4 h-4" /> Create Event</>
                )}
              </button>
              <Link href="/dashboard/events" className="btn-secondary">Cancel</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
