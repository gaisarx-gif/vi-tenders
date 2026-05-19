import { useEffect, useMemo, useState } from 'react';
import type { TenderIssue, Tender, CalendarEvent } from '../types';
import { toast } from 'sonner';
import type { Language } from '../lib/translations';
import { TenderDetails } from './TenderDetails';
import { Analytics } from './Analytics';
import { CalendarView } from './CalendarView';
import { CompaniesView } from './CompaniesView';
import { OrganizationsView } from './OrganizationsView';

import { DashboardShell } from '../views/_layout/DashboardShell';
import { OverviewView } from '../views/OverviewView';
import { AllTendersView } from '../views/AllTendersView';
import { AnalysisView } from '../views/AnalysisView';
import { ImportView } from '../views/ImportView';
import { WatchlistView } from '../views/WatchlistView';
import { NotificationsView } from '../views/NotificationsView';
import { AdminView } from '../views/AdminView';
import { UploadPanel } from './UploadPanel';
import { AddTenderModal } from '../views/AddTenderModal';

import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface DashboardProps {
  issues: TenderIssue[];
  tenders: Tender[];
  activeIssue?: TenderIssue;
  onFilterChange: (filter: { type: 'status' | 'org' | 'all'; value: string }) => void;
  currentFilter: { type: 'status' | 'org' | 'all'; value: string };
  language: Language;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  unreadCount: number;
}

export function Dashboard({
  issues,
  tenders: allTenders,
  activeIssue,
  onFilterChange,
  currentFilter,
  language,
  activeTab,
  setActiveTab,
  theme,
  onThemeToggle,
  unreadCount,
}: DashboardProps) {
  const { user } = useAuth();
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTender, setIsAddingTender] = useState(false);

  // PDF analysis state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [reviewTenders, setReviewTenders] = useState<Tender[] | null>(null);
  const [issueNumber, setIssueNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');

  // Calendar + error state
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Pagination + loading state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCalendarEvents = async () => {
    try {
      setFetchError(null);
      const json = await api.get<{ data?: CalendarEvent[] }>('/api/calendar');
      setCalendarEvents(json.data ?? json as unknown as CalendarEvent[]);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch calendar';
      setFetchError(msg);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
    const interval = setInterval(fetchCalendarEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!issueNumber || !issueDate) {
      toast.error('Please enter Issue Number and Date first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage('Uploading PDF for server-side analysis...');
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1];
          setUploadProgress(30);
          setUploadMessage('Analyzing PDF with AI...');

          const tenders: Tender[] = await api.post('/api/ingest/pdf', {
            file: base64,
            issueNumber,
            issueDate,
          }).then((r: unknown) => (r as { tenders: Tender[] }).tenders);

          if (tenders.length === 0) {
            toast.error('No tenders found in this PDF.');
            setIsUploading(false);
            return;
          }

          setUploadProgress(100);
          setReviewTenders(tenders);
          setIsUploading(false);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'AI analysis failed.';
          toast.error(message);
          setIsUploading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      toast.error(message);
      setIsUploading(false);
    }
  };

  const handleConfirmReview = async (tenders: Tender[]) => {
    try {
      setIsUploading(true);
      setUploadMessage('Saving to database...');

      await api.post('/api/admin/issues', {
        issueNumber,
        date: issueDate,
        tenders,
      });

      setIssueNumber('');
      setIssueDate('');
      setReviewTenders(null);
      setActiveTab('overview');
      toast.success(`Successfully saved ${tenders.length} tenders!`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save tenders';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleExcelImport = async (fileBase64: string): Promise<void> => {
    try {
      setIsUploading(true);
      setUploadMessage('Parsing Excel via server pipeline...');

      const result = await api.post<{ tenders: Tender[]; errors?: unknown[]; stats?: { valid: number; skipped: number } }>('/api/ingest/excel', {
        file: fileBase64,
      });

      const { tenders, errors, stats } = result;

      if (!tenders || tenders.length === 0) {
        toast.error('No valid tenders found in this Excel file.');
        return;
      }

      if (errors && errors.length > 0) {
        toast.warning(`Imported ${stats?.valid} valid rows; ${stats?.skipped} skipped.`);
      }

      setUploadMessage('Saving to database...');
      await api.post('/api/admin/issues', {
        issueNumber: `Imported-${new Date().toLocaleDateString()}`,
        date: new Date().toISOString().split('T')[0],
        tenders,
      });

      toast.success(`Successfully imported ${tenders.length} tenders from Excel`);
      setActiveTab('overview');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import Excel data';
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateTender = async (updatedTender: Tender) => {
    try {
      await api.patch(`/api/tenders/${updatedTender.id}`, {
        ...updatedTender,
        issueId: selectedTender?.issueId,
      });
      setSelectedTender(updatedTender);
      toast.success('Tender updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update tender';
      toast.error(message);
    }
  };

  // ---------- Derived data ----------

  const filteredTenders = useMemo(() => {
    let result = activeIssue
      ? allTenders.filter((t) => t.issueId === activeIssue.id)
      : allTenders;

    if (currentFilter.type === 'status' && currentFilter.value) {
      result = result.filter(
        (t) => t.statusEn === currentFilter.value || t.status === currentFilter.value,
      );
    } else if (currentFilter.type === 'org' && currentFilter.value) {
      result = result.filter(
        (t) =>
          t.organizationNameEn === currentFilter.value ||
          t.organizationNameAr === currentFilter.value ||
          t.organizationName === currentFilter.value,
      );
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((t) =>
        [t.tenderNo, t.description, t.organizationNameAr, t.organizationNameEn, t.organizationName]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      );
    }

    return result;
  }, [activeIssue, allTenders, currentFilter, searchQuery]);

  // ---------- Render ----------

  if (selectedTender) {
    return (
      <DashboardShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        theme={theme}
        onThemeToggle={onThemeToggle}
        unreadCount={unreadCount}
        onAddTender={() => setIsAddingTender(true)}
      >
        <TenderDetails
          tender={selectedTender}
          language={language}
          onBack={() => setSelectedTender(null)}
          onUpdateTender={handleUpdateTender}
          userRole={user?.role ?? null}
        />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      language={language}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      theme={theme}
      onThemeToggle={onThemeToggle}
      unreadCount={unreadCount}
      onAddTender={() => setIsAddingTender(true)}
    >
      <AddTenderModal
        open={isAddingTender}
        language={language}
        onClose={() => setIsAddingTender(false)}
      />

      {fetchError && (
        <div className="px-4 py-2 text-sm text-destructive bg-destructive/10 rounded-xl mb-4">
          Calendar fetch failed: {fetchError}
        </div>
      )}

      {activeTab === 'overview' && (
        <OverviewView
          allTenders={allTenders}
          filteredTenders={filteredTenders}
          issues={issues}
          calendarEvents={calendarEvents}
          language={language}
          onSelectTender={setSelectedTender}
          setActiveTab={setActiveTab}
          onFilterChange={onFilterChange}
        />
      )}

      {activeTab === 'all-tenders' && (
        <AllTendersView
          tenders={filteredTenders}
          language={language}
          onSelectTender={setSelectedTender}
          loading={loading}
          onRefresh={async () => {
            setLoading(true);
            try {
              setPage(1);
              setLastDocId(null);
              setHasMore(true);
            } finally {
              setLoading(false);
            }
          }}
          page={page}
          hasMore={hasMore}
          onNextPage={async () => {
            setLoading(true);
            try {
              const next = await api.get<{ lastDocId: string; hasMore: boolean }>('/api/tenders?page=' + (page + 1) + (lastDocId ? '&lastDocId=' + lastDocId : ''));
              setPage(p => p + 1);
              setLastDocId(next.lastDocId);
              setHasMore(next.hasMore);
            } finally {
              setLoading(false);
            }
          }}
          onPrevPage={() => {
            setPage(p => Math.max(1, p - 1));
          }}
        />
      )}

      {activeTab === 'analysis' && (
        <AnalysisView
          issues={issues}
          reviewTenders={reviewTenders}
          setReviewTenders={setReviewTenders}
          issueNumber={issueNumber}
          setIssueNumber={setIssueNumber}
          issueDate={issueDate}
          setIssueDate={setIssueDate}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          uploadMessage={uploadMessage}
          onFileUpload={handleFileUpload}
          onConfirmReview={handleConfirmReview}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'import' && <ImportView onFileSelected={handleExcelImport} />}

      {activeTab === 'watchlist' && (
        <WatchlistView
          language={language}
          allTenders={allTenders}
          onSelectTender={(tender) => {
            setSelectedTender(tender);
            setActiveTab('overview');
          }}
        />
      )}

      {activeTab === 'analytics' && <Analytics tenders={allTenders} />}

      {activeTab === 'notifications' && <NotificationsView language={language} />}

      {activeTab === 'companies' && <CompaniesView />}

      {activeTab === 'calendar' && (
        <CalendarView
          events={calendarEvents}
          onEventAdded={fetchCalendarEvents}
          onEventDeleted={fetchCalendarEvents}
        />
      )}

      {activeTab === 'organizations' && (
        <OrganizationsView
          allTenders={allTenders}
          onSelectOrg={(orgName) => {
            onFilterChange({ type: 'org', value: orgName });
            setActiveTab('all-tenders');
          }}
        />
      )}

      {activeTab === 'admin' && user?.role === 'admin' && (
        <>
          <UploadPanel role={user?.role} />
          <AdminView />
        </>
      )}
    </DashboardShell>
  );
}
