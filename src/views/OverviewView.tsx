import { useMemo } from 'react';
import type { Language } from '../lib/translations';
import { translations } from '../lib/translations';
import type { Tender, TenderIssue, CalendarEvent } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { TenderTable } from '../components/TenderTable';

interface OverviewViewProps {
  allTenders: Tender[];
  filteredTenders: Tender[];
  issues: TenderIssue[];
  calendarEvents: CalendarEvent[];
  language: Language;
  onSelectTender: (tender: Tender) => void;
  setActiveTab: (tab: string) => void;
  onFilterChange: (filter: { type: 'status' | 'org' | 'all'; value: string }) => void;
}

export function OverviewView({
  allTenders,
  filteredTenders,
  issues,
  calendarEvents,
  language,
  onSelectTender,
  setActiveTab,
  onFilterChange,
}: OverviewViewProps) {
  const t = translations[language];
  const watchlistedCount = useMemo(
    () => allTenders.filter((t) => t.watchlisted).length,
    [allTenders],
  );

  const closingSoonCount = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    return allTenders.filter((t) => {
      if (!t.closingDate || t.closingDate === 'N/C') return false;
      const closeDate = new Date(t.closingDate);
      return closeDate >= now && closeDate <= nextWeek;
    }).length;
  }, [allTenders]);

  const tendersByIssue = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of allTenders) {
      map.set(t.issueId, (map.get(t.issueId) || 0) + 1);
    }
    return map;
  }, [allTenders]);

  const newTendersCount = useMemo(
    () => allTenders.filter((t) => t.statusEn === 'New Tender').length,
    [allTenders],
  );

  return (
    <>
      <h2 className="text-2xl font-bold text-white mb-6">{t.dashboard}</h2>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content (Left) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-none p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t.newTenders}</p>
              <h3 className="text-3xl font-bold text-foreground">{newTendersCount}</h3>
            </Card>
            <Card className="bg-card border-none p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t.activeTenders}</p>
              <h3 className="text-3xl font-bold text-foreground">{allTenders.length}</h3>
            </Card>
            <Card className="bg-card border-none p-5 rounded-xl border-l-4 border-destructive/50">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-muted-foreground">{t.closingSoon}</p>
                <AlertCircle className="h-4 w-4 text-destructive" />
              </div>
              <h3 className="text-3xl font-bold text-foreground">{closingSoonCount}</h3>
            </Card>
            <Card className="bg-card border-none p-5 rounded-xl">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t.watchlistItems}</p>
              <h3 className="text-3xl font-bold text-foreground">{watchlistedCount}</h3>
            </Card>
          </div>

          {/* Latest Tenders Table */}
          <Card className="bg-card border-none rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">{t.latestTenders}</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => setActiveTab('all-tenders')}
              >
                {t.viewAll}
              </Button>
            </div>
            <div className="overflow-x-auto">
              <TenderTable
                tenders={filteredTenders.slice(0, 5)}
                language={language}
                onSelectTender={onSelectTender}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar Widgets (Right) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Deadlines & Calendar */}
          <Card className="bg-card border-none rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-foreground">{t.deadlinesCalendar}</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('calendar')}>
                {t.viewAll}
              </Button>
            </div>
            <div className="space-y-4">
              {calendarEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      event.purpose === 'follow_up'
                        ? 'bg-blue-500'
                        : event.purpose === 'meeting'
                          ? 'bg-amber-500'
                          : 'bg-slate-500'
                    }`}
                  />
                  <div>
                    <p className="text-xs font-bold text-foreground">{event.description}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {calendarEvents.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {t.noUpcomingEvents}
                </p>
              )}
            </div>
          </Card>

          {/* Latest Issues */}
          <Card className="bg-card border-none rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold text-foreground">{t.latestIssues}</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('analysis')}>
                {t.viewAll}
              </Button>
            </div>
            <div className="space-y-4">
              {issues.slice(0, 5).map((issue) => (
                <button
                  key={issue.id}
                  type="button"
                  onClick={() => onFilterChange({ type: 'all', value: '' })}
                  className="w-full flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors text-start"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">
                      {t.issueLabel} #{issue.issueNumber}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(issue.date).toLocaleDateString(language === 'ar' ? 'ar' : 'en')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">
                    {tendersByIssue.get(issue.id) || 0}
                  </Badge>
                </button>
              ))}
              {issues.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  {t.noIssuesYet}
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
