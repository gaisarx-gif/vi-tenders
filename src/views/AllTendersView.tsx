import type { Language } from '../lib/translations';
import { translations } from '../lib/translations';
import type { Tender } from '../types';
import { Card } from '@/components/ui/card';
import { TenderTable } from '../components/TenderTable';

interface AllTendersViewProps {
  tenders: Tender[];
  language: Language;
  onSelectTender: (tender: Tender) => void;
  loading?: boolean;
  onRefresh?: () => void;
  page?: number;
  hasMore?: boolean;
  onNextPage?: () => void;
  onPrevPage?: () => void;
}

export function AllTendersView({ tenders, language, onSelectTender, loading, onRefresh, page, hasMore, onNextPage, onPrevPage }: AllTendersViewProps) {
  const t = translations[language];
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">{t.allTenders}</h2>
      <Card className="bg-card border-none rounded-xl overflow-hidden">
        <TenderTable
          tenders={tenders}
          language={language}
          onSelectTender={onSelectTender}
          loading={loading}
          onRefresh={onRefresh}
          page={page}
          hasMore={hasMore}
          onNextPage={onNextPage}
          onPrevPage={onPrevPage}
        />
      </Card>
    </div>
  );
}
