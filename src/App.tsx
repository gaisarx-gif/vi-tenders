import { useEffect } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './components/AppSidebar';
import { Dashboard } from './components/Dashboard';
import { LandingPage } from './components/LandingPage';
import { TenderIssue, Tender } from './types';
import { Toaster, toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LoginPage } from './views/LoginPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useNotifications } from '../hooks/use-notifications';
import { useState } from 'react';
import { api } from './lib/api';

function AppInner() {
  const { user, loading, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggle: onThemeToggle } = useTheme();
  const [issues, setIssues] = useState<TenderIssue[]>([]);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [activeIssue, setActiveIssue] = useState<TenderIssue | undefined>(undefined);
  const [globalFilter, setGlobalFilter] = useState<{
    type: 'status' | 'org' | 'all';
    value: string;
  }>({ type: 'all', value: '' });
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isAuthenticated = user !== null;

  const { unreadCount } = useNotifications(isAuthenticated && !loading);

  useEffect(() => {
    if (!isAuthenticated || loading) return;

    const unsubIssues = onSnapshot(
      query(collection(db, 'issues'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as TenderIssue[];
        setIssues(data);
        setActiveIssue((prev) => (data.length > 0 && !prev ? data[0] : prev));
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'issues'),
    );

    const unsubTenders = onSnapshot(
      query(collection(db, 'tenders'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        setTenders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Tender[]);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'tenders'),
    );

    return () => { unsubIssues(); unsubTenders(); };
  }, [isAuthenticated, loading]);

  const handleDeleteIssue = async (issueId: string) => {
    try {
      await api.delete(`/admin/issues/${issueId}`);
      if (activeIssue?.id === issueId) setActiveIssue(undefined);
      toast.success('Issue deleted successfully');
    } catch {
      toast.error('Failed to delete issue');
    }
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return showLogin ? (
      <LoginPage onLogin={() => setShowLogin(false)} />
    ) : (
      <LandingPage
        language={language}
        onGetStarted={() => setShowLogin(true)}
        onLanguageChange={() => {}}
        theme={theme}
        onThemeToggle={onThemeToggle}
      />
    );
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div
          className="flex min-h-screen w-full bg-background"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <AppSidebar
            onLogout={signOut}
            language={language}
            onLanguageChange={setLanguage}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <main className="flex-1 overflow-auto relative">
            <div className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-50`}>
              <SidebarTrigger className="bg-white shadow-md border border-border" />
            </div>
            <Dashboard
              issues={issues}
              tenders={tenders}
              activeIssue={activeIssue}
              onFilterChange={setGlobalFilter}
              currentFilter={globalFilter}
              language={language}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              theme={theme}
              onThemeToggle={onThemeToggle}
              unreadCount={unreadCount}
            />
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <AppInner />
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
