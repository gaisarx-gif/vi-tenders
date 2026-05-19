import { useState } from 'react';
import { Tender } from '../types';
import { translations, Language } from '../lib/translations';
import { Calendar, Clock, CheckCircle2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { TenderHeader } from './TenderDetails/TenderHeader';
import { TenderDescription } from './TenderDetails/TenderDescription';
import { TenderTimeline } from './TenderDetails/TenderTimeline';
import { TenderDocuments } from './TenderDetails/TenderDocuments';
import { TenderWatchlist } from './TenderDetails/TenderWatchlist';

import { api } from '../lib/api';

interface TenderDetailsProps {
  tender: Tender;
  language: Language;
  onBack: () => void;
  onUpdateTender?: (tender: Tender) => void;
  userRole?: 'admin' | 'user' | null;
}

export function TenderDetails({
  tender,
  language,
  onBack,
  onUpdateTender,
  userRole,
}: TenderDetailsProps) {
  const t = translations[language];
  const [localDocuments, setLocalDocuments] = useState(tender.documents || []);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const [isWatchlisting, setIsWatchlisting] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventDate, setEventDate] = useState('');
  const [eventPurpose, setEventPurpose] = useState<'follow_up' | 'meeting' | 'other'>('follow_up');
  const [eventDescription, setEventDescription] = useState('');
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === 'N/C' || dateStr === 'N/A') return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return format(date, 'PPP', { locale: language === 'ar' ? ar : enUS });
    } catch {
      return dateStr;
    }
  };

  const handleAddToWatchlist = async () => {
    setIsWatchlisting(true);
    try {
      await api.post('/api/subscriptions', {
        tenderNo: tender.tenderNo,
        organizationName: tender.organizationName,
      });
      toast.success(t.tenderSubscribed || 'Added to watchlist');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to add to watchlist';
      toast.error(msg);
    } finally {
      setIsWatchlisting(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!eventDate) {
      toast.error('Please select a date');
      return;
    }
    setIsCreatingEvent(true);
    try {
      await api.post('/api/calendar', {
        date: eventDate,
        purpose: eventPurpose,
        tenderNo: tender.tenderNo,
        organizationName: tender.organizationName,
        description: eventDescription || `${tender.tenderNo} - ${tender.organizationName}`,
      });
      toast.success('Calendar event created');
      setShowEventModal(false);
      setEventDate('');
      setEventDescription('');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(msg);
    } finally {
      setIsCreatingEvent(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc = {
        name: file.name,
        url: URL.createObjectURL(file),
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      };
      const updatedDocs = [...localDocuments, newDoc];
      setLocalDocuments(updatedDocs);
      onUpdateTender?.({ ...tender, documents: updatedDocs });
    }
  };

  const removeDocument = (index: number) => {
    const updatedDocs = localDocuments.filter((_, i) => i !== index);
    setLocalDocuments(updatedDocs);
    onUpdateTender?.({ ...tender, documents: updatedDocs });
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    try {
      const data = await api.post<{ summary: string }>('/api/tenders/summarize', { tender });
      setAiSummary(data.summary);
      toast.success('AI Summary generated!');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to generate AI summary';
      toast.error(msg);
    } finally {
      setIsSummarizing(false);
    }
  };

  const timelineItems = [
    {
      label: t.pubDate,
      value: formatDate(tender.publishingDate),
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Pre-tender Meeting',
      value: formatDate(tender.pretenderMeeting),
      icon: Clock,
      color: 'bg-amber-500',
    },
    {
      label: t.closingDate,
      value: formatDate(tender.closingDate),
      icon: CheckCircle2,
      color: 'bg-emerald-500',
    },
  ].filter((item) => item.value !== null);

  return (
    <div
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <TenderHeader
        tender={tender}
        language={language}
        userRole={userRole}
        t={t}
        isSubscribedToTender={false}
        isSubscribing={false}
        onBack={onBack}
        onSubscribe={() => {}}
        onStatusUpdate={() => {}}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <TenderDescription
            description={tender.description}
            aiSummary={aiSummary}
            isSummarizing={isSummarizing}
            language={language}
            t={t}
            onSummarize={handleSummarize}
            onDismissSummary={() => setAiSummary(null)}
          />

          <TenderTimeline items={timelineItems} title={t.timeline} />
        </div>

        <div className="space-y-8">
          <TenderDocuments
            documents={localDocuments}
            language={language}
            t={t}
            onFileUpload={handleFileUpload}
            onRemoveDocument={removeDocument}
          />

          <TenderWatchlist
            tender={tender}
            t={t}
            isWatchlisting={isWatchlisting}
            onAddToWatchlist={handleAddToWatchlist}
            deadlineLabel={`Deadline: ${formatDate(tender.closingDate) || ''}`}
          />

          {/* Create Event Card */}
          <Card className="rounded-[24px] border-slate-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {language === 'ar' ? 'حدث' : 'Event'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setShowEventModal(true)}
                className="w-full rounded-full h-12 gap-2"
              >
                <Plus className="h-4 w-4" />
                {language === 'ar' ? 'إنشاء حدث' : 'Create Event'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4 rounded-[24px] shadow-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-black">
                {language === 'ar' ? 'إنشاء حدث' : 'Create Event'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {language === 'ar' ? 'التاريخ' : 'Date'}
                </Label>
                <Input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {language === 'ar' ? 'الغرض' : 'Purpose'}
                </Label>
                <select
                  value={eventPurpose}
                  onChange={(e) => setEventPurpose(e.target.value as typeof eventPurpose)}
                  className="w-full h-10 rounded-xl border border-border bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="follow_up">Follow Up</option>
                  <option value="meeting">Meeting</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </Label>
                <Input
                  type="text"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder={tender.tenderNo}
                  className="rounded-xl"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-full"
                  onClick={() => setShowEventModal(false)}
                  disabled={isCreatingEvent}
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  onClick={handleCreateEvent}
                  disabled={isCreatingEvent}
                >
                  {isCreatingEvent ? 'Saving...' : language === 'ar' ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
