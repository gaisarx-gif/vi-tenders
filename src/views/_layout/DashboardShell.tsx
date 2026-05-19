import type { ReactNode } from 'react';
import type { Language } from '../../lib/translations';
import { translations } from '../../lib/translations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Bell,
  User as UserIcon,
  FileUp,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';

interface DashboardShellProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  unreadCount: number;
  onAddTender: () => void;
  children: ReactNode;
}

export function DashboardShell({
  activeTab,
  setActiveTab,
  language,
  searchQuery,
  setSearchQuery,
  theme,
  onThemeToggle,
  unreadCount,
  onAddTender,
  children,
}: DashboardShellProps) {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`text-sm font-medium transition-colors pb-1 border-b-2 ${activeTab === 'overview' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
            >
              {t.dashboard}
            </button>
            <button
              onClick={() => setActiveTab('all-tenders')}
              className={`text-sm font-medium transition-colors pb-1 border-b-2 ${activeTab === 'all-tenders' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
            >
              {t.allTenders}
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`text-sm font-medium transition-colors pb-1 border-b-2 ${activeTab === 'analysis' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
            >
              {t.kuwaitAlyoum}
            </button>
            <button
              onClick={() => setActiveTab('watchlist')}
              className={`text-sm font-medium transition-colors pb-1 border-b-2 ${activeTab === 'watchlist' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
            >
              {t.watchlist}
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              className={`text-sm font-medium transition-colors pb-1 border-b-2 ${activeTab === 'companies' ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-slate-200'}`}
            >
              {t.companies}
            </button>
          </nav>

          <div className="flex-1 max-w-md relative">
            <Search className={`absolute ${language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500`} />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`${language === 'ar' ? 'pr-10' : 'pl-10'} bg-[#1e293b] border-none text-slate-200 placeholder:text-slate-500 h-9 rounded-lg focus-visible:ring-1 focus-visible:ring-primary/50`}
            />
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onThemeToggle}
              className="rounded-full hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-slate-700" />
              )}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border-none gap-2 h-9 px-4"
              onClick={() => setActiveTab('import')}
            >
              <FileUp className="h-4 w-4" />
              {t.uploadExcel}
            </Button>
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white gap-2 h-9 px-4"
              onClick={onAddTender}
            >
              <Plus className="h-4 w-4" />
              {t.newTender}
            </Button>
            <div className="relative" onClick={() => setActiveTab('notifications')}>
              <Bell className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-200 transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-[10px] flex items-center justify-center rounded-full text-white border-2 border-[#0f172a]">
                  {unreadCount}
                </span>
              )}
            </div>
            <div
              className="h-8 w-8 rounded-full bg-accent border border-white/10 flex items-center justify-center cursor-pointer"
              aria-label="User profile"
            >
              <UserIcon className="h-4 w-4 text-accent-foreground" aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">{children}</main>
    </div>
  );
}
