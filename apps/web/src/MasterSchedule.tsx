import { useEffect, useState, useCallback } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { EventType } from '@hiresphere/shared';
import { api } from './lib/api';
import { useToast } from './components/Toast';
import { CardSkeleton } from './components/Skeleton';
import {
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Panel,
  Select,
  StatusTag,
  Tabs,
} from './components/ui';

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
  const [view, setView] = useState('list');
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
        showToast('Event updated.', 'success');
      } else {
        await api.post('/api/events', payload);
        showToast('Event created.', 'success');
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
      showToast('Event deleted.', 'info');
      await loadEvents();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete event', 'error');
    }
  };

  // Group events by date for Week/Day grouped view
  const groupedByDay = events.reduce((acc, ev) => {
    const key = new Date(ev.startsAt).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    if (!acc[key]) acc[key] = [];
    acc[key].push(ev);
    return acc;
  }, {} as Record<string, EventItem[]>);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Master Schedule"
        description="Coordinate pre-placement talks, online tests, and interview panels."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            New event
          </Button>
        }
      />

      <Panel padded={false} className="overflow-hidden">
        <div className="px-4 pt-2">
          <Tabs
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: 'List view', count: events.length },
              { value: 'grouped', label: 'By date', count: Object.keys(groupedByDay).length },
            ]}
          />
        </div>

        <div className="p-4">
          {isLoading ? (
            <CardSkeleton rows={4} />
          ) : events.length === 0 ? (
            <EmptyState
              message="No placement events scheduled yet."
              action={
                <Button size="sm" variant="secondary" onClick={openCreate}>
                  Schedule event
                </Button>
              }
            />
          ) : view === 'list' ? (
            <div className="divide-y divide-hairline border border-hairline rounded-[6px]">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="px-4 py-3 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <StatusTag status={ev.type} />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-ink truncate">{ev.title}</p>
                      <p className="font-mono text-[11px] text-muted tabular-nums">
                        {new Date(ev.startsAt).toLocaleString('en-IN')} –{' '}
                        {new Date(ev.endsAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEdit(ev)}
                      aria-label={`Edit ${ev.title}`}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] text-muted hover:text-ink hover:bg-subtle cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ev.id)}
                      aria-label={`Delete ${ev.title}`}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] text-muted hover:text-status-rejected hover:bg-status-rejected-bg cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedByDay).map(([day, items]) => (
                <div key={day} className="space-y-2">
                  <p className="font-mono text-[12px] font-medium text-muted">{day}</p>
                  <div className="divide-y divide-hairline border border-hairline rounded-[6px]">
                    {items.map((ev) => (
                      <div
                        key={ev.id}
                        className="px-4 py-2.5 bg-surface flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <StatusTag status={ev.type} />
                          <span className="text-[13px] font-medium text-ink truncate">
                            {ev.title}
                          </span>
                        </div>
                        <span className="font-mono text-[12px] text-muted tabular-nums shrink-0">
                          {new Date(ev.startsAt).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editing ? 'Edit Event' : 'Schedule Event'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Event title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Select
            label="Event type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
          >
            <option value="INTERVIEW">INTERVIEW</option>
            <option value="TEST">TEST</option>
            <option value="PPT">PPT</option>
            <option value="OTHER">OTHER</option>
          </Select>
          <Input
            label="Starts at"
            type="datetime-local"
            required
            value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
          />
          <Input
            label="Ends at"
            type="datetime-local"
            required
            value={form.endsAt}
            onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save event'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
