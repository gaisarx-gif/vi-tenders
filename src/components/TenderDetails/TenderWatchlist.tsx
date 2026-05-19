import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tender } from '../../types';
import { Bookmark, Loader2 } from 'lucide-react';

interface TenderWatchlistProps {
  tender: Tender;
  t: Record<string, string>;
  isWatchlisting: boolean;
  onAddToWatchlist: () => void;
  deadlineLabel: string;
}

export function TenderWatchlist({
  tender,
  t,
  isWatchlisting,
  onAddToWatchlist,
  deadlineLabel,
}: TenderWatchlistProps) {
  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl" />
      <CardHeader>
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <Bookmark className="h-5 w-5 text-secondary" />
          {t.watchlist}
        </CardTitle>
        <CardDescription className="text-slate-400 font-medium">
          Subscribe to get notified about this tender
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          onClick={onAddToWatchlist}
          disabled={isWatchlisting}
          className="w-full rounded-full h-12 bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg shadow-secondary/20"
        >
          {isWatchlisting ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Bookmark className="h-4 w-4 mr-2" />
          )}
          {isWatchlisting ? 'Adding...' : t.addToWatchlist}
        </Button>

        {tender.closingDate && tender.closingDate !== 'N/C' && (
          <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest">
            {deadlineLabel}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
