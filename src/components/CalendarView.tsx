import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Clock,
  Building2,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { toast } from 'sonner';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventAdded?: () => void;
  onEventDeleted?: () => void;
}

export function CalendarView({
  events,
  onEventAdded,
  onEventDeleted,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    purpose: 'follow_up',
    description: '',
    tenderNo: '',
    organizationName: '',
  });

  const handleAddEvent = async () => {
    if (!selectedDate || !newEvent.description) {
      toast.error('Please fill in the required fields.');
      return;
    }

    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEvent,
          date: selectedDate.toISOString().split('T')[0],
        }),
      });

      if (response.ok) {
        toast.success('Event added successfully!');
        setIsAddingEvent(false);
        setNewEvent({ purpose: 'follow_up', description: '', tenderNo: '', organizationName: '' });
        onEventAdded?.();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        toast.error(`Failed to add event: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to add event');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/calendar/${id}`, { method: 'DELETE' });
      if (response.ok) {
        onEventDeleted?.();
        toast.success('Event removed');
      } else {
        toast.error('Failed to remove event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to remove event');
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const eventsOnDate = (date: Date) => events.filter((e) => isSameDay(new Date(e.date), date));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Calendar Grid */}
      <Card className="lg:col-span-8 bg-card border-none rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <CardDescription>Manage your tender follow-ups and meetings</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-border">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div
                key={d}
                className="py-3 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const dayEvents = eventsOnDate(day);
              return (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedDate(day);
                    setIsAddingEvent(true);
                  }}
                  className={`min-h-[120px] p-2 border-r border-b border-border hover:bg-accent/30 transition-colors cursor-pointer relative ${isToday(day) ? 'bg-primary/5' : ''}`}
                >
                  <span
                    className={`text-xs font-bold ${isToday(day) ? 'text-primary' : 'text-muted-foreground'}`}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="mt-2 space-y-1">
                    {dayEvents.map((e) => (
                      <div
                        key={e.id}
                        className={`text-[9px] p-1 rounded font-bold truncate ${
                          e.purpose === 'follow_up'
                            ? 'bg-blue-500/10 text-blue-500'
                            : e.purpose === 'meeting'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-slate-500/10 text-slate-500'
                        }`}
                      >
                        {e.description}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Events List & Form */}
      <div className="lg:col-span-4 space-y-6">
        {isAddingEvent && selectedDate && (
          <Card className="bg-card border-none rounded-xl p-6 shadow-xl border border-primary/20">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Add Event for {format(selectedDate, 'MMM d, yyyy')}
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Purpose
                </Label>
                <select
                  value={newEvent.purpose}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      purpose: e.target.value as CalendarEvent['purpose'],
                    })
                  }
                  className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="follow_up">Tender Follow-up</option>
                  <option value="meeting">Pre-tender Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Tender No (Optional)
                </Label>
                <Input
                  value={newEvent.tenderNo}
                  onChange={(e) => setNewEvent({ ...newEvent, tenderNo: e.target.value })}
                  placeholder="e.g. KM/123/2024"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Organization (Optional)
                </Label>
                <Input
                  value={newEvent.organizationName}
                  onChange={(e) => setNewEvent({ ...newEvent, organizationName: e.target.value })}
                  placeholder="e.g. Ministry of Health"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Description
                </Label>
                <Input
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="What needs to be done?"
                  className="bg-background border-border"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddEvent} className="flex-1 bg-primary text-white font-bold">
                  Save Event
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setIsAddingEvent(false)}
                  className="text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Card className="bg-card border-none rounded-xl p-6">
          <h3 className="text-sm font-bold mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Upcoming Events
          </h3>
          <div className="space-y-4">
            {events
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((event) => (
                <div
                  key={event.id}
                  className="group flex items-start justify-between p-3 rounded-xl bg-accent/30 border border-transparent hover:border-primary/20 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-[8px] h-4 px-1 ${
                          event.purpose === 'follow_up'
                            ? 'text-blue-500 border-blue-500/20'
                            : event.purpose === 'meeting'
                              ? 'text-amber-500 border-amber-500/20'
                              : 'text-slate-500 border-slate-500/20'
                        }`}
                      >
                        {event.purpose.replace('_', ' ')}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {format(new Date(event.date), 'MMM d')}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-foreground">{event.description}</p>
                    {(event.tenderNo || event.organizationName) && (
                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                        {event.tenderNo && (
                          <span className="flex items-center gap-1">
                            <FileText className="h-2 w-2" /> {event.tenderNo}
                          </span>
                        )}
                        {event.organizationName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-2 w-2" /> {event.organizationName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            {events.length === 0 && (
              <div className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-20" />
                <p className="text-xs text-muted-foreground">No events scheduled.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
