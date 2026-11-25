import { useEffect, useState, useCallback } from 'react';
import type { EventType } from '@hiresphere/shared';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';

interface EventItem {
  id: string;
  title: string;
  type: EventType;
  startsAt: string;
  endsAt: string;
  driveId: string | null;
}

export default function MasterSchedule() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    type: 'INTERVIEW' as EventType,
    startsAt: '',
    endsAt: '',
  });

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ events: EventItem[] }>('/api/events?all=true');
      setEvents(res.events || []);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load events', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const openCreate = () => {
    setEditing(null);
    const start = new Date(Date.now() + 86400000);
    const end = new Date(start.getTime() + 7200000);
    setForm({
      title: '',
      type: 'INTERVIEW',
      startsAt: start.toISOString().slice(0, 16),
      endsAt: end.toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const openEdit = (ev: EventItem) => {
    setEditing(ev);
    setForm({
      title: ev.title,
      type: ev.type,
      startsAt: new Date(ev.startsAt).toISOString().slice(0, 16),
      endsAt: new Date(ev.endsAt).toISOString().slice(0, 16),
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        title: form.title,
        type: form.type,
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
      };
      if (editing) {
        await api.put(`/api/events/${editing.id}`, payload);
        showToast('Event updated!', 'success');
      } else {
        await api.post('/api/events', payload);
        showToast('Event created!', 'success');
      }
      setIsModalOpen(false);
      await loadEvents();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to save event', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/events/${id}`);
      showToast('Event deleted', 'info');
      await loadEvents();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete event', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Master Schedule
          </h2>
          <p className="text-sm text-slate-500">
            Create and manage campus placement tests, PPTs, and interviews.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold shadow self-start sm:self-auto"
        >
          + New Event
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6">
        {isLoading ? (
          <CardSkeleton rows={4} />
        ) : events.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No events scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/15 text-purple-500">
                    {ev.type}
                  </span>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-1">{ev.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(ev.startsAt).toLocaleString()} →{' '}
                    {new Date(ev.endsAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(ev)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(ev.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editing ? 'Edit Event' : 'New Event'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="INTERVIEW">INTERVIEW</option>
                  <option value="TEST">TEST</option>
                  <option value="PPT">PPT</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Starts At</label>
                <input
                  type="datetime-local"
                  required
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Ends At</label>
                <input
                  type="datetime-local"
                  required
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm bg-slate-200 dark:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg text-sm font-bold bg-purple-600 text-white disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
