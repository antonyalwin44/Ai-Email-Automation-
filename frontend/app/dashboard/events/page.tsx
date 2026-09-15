'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Calendar, MapPin, Clock, Edit2, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
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
  created_by_name: string;
  created_at: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  'Annual Day': 'badge-purple',
  'Birthday': 'badge-yellow',
  'Meeting': 'badge-blue',
  'Workshop': 'badge-green',
  'Festival': 'badge-red',
  'Training': 'badge-blue',
  'Sports Day': 'badge-green',
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showUpcoming, setShowUpcoming] = useState(false);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/events', { params: { upcoming: showUpcoming ? 'true' : '' } });
      setEvents(res.data.events);
    } catch {
      toast.error('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  }, [showUpcoming]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/events/${deleteId}`);
      toast.success('Event deleted!');
      setDeleteId(null);
      loadEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Delete failed.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isUpcoming = (date: string) => new Date(date) >= new Date(new Date().toDateString());

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatTime = (time: string) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Event Management</h1>
          <p className="page-subtitle">{events.length} events in the system</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUpcoming(!showUpcoming)}
            className={showUpcoming ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}
          >
            <Calendar className="w-4 h-4" />
            {showUpcoming ? 'All Events' : 'Upcoming Only'}
          </button>
          <Link href="/dashboard/events/create" className="btn-primary">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><LoadingSpinner text="Loading events..." /></div>
      ) : events.length === 0 ? (
        <div className="card py-20 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No events found.</p>
          <Link href="/dashboard/events/create" className="text-brand-600 text-sm font-medium hover:underline mt-1 inline-block">
            Create your first event →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {events.map((event) => (
            <div key={event.id} className="card hover:shadow-md transition-shadow duration-200 animate-fade-in">
              {/* Status ribbon */}
              <div className={`h-1 rounded-t-xl ${isUpcoming(event.event_date) ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <span className={`badge ${EVENT_TYPE_COLORS[event.event_type] || 'badge-gray'} mb-2`}>
                      <Tag className="w-3 h-3 mr-1" />{event.event_type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-tight">{event.event_name}</h3>
                  </div>
                  {isUpcoming(event.event_date) ? (
                    <span className="badge badge-green flex-shrink-0">Upcoming</span>
                  ) : (
                    <span className="badge badge-gray flex-shrink-0">Past</span>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {formatTime(event.event_time)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {event.venue}
                  </div>
                </div>

                {event.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">{event.description}</p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Link
                    href={`/dashboard/events/${event.id}/edit`}
                    className="btn-secondary btn-sm flex-1 justify-center"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => setDeleteId(event.id)}
                    className="btn-danger btn-sm flex-1 justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? All associated email logs will remain but the event will be removed."
        confirmText="Delete Event"
        isLoading={isDeleting}
      />
    </div>
  );
}
