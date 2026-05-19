import type { Language } from '../lib/translations';
import type { Tender } from '../types';
import { Watchlist } from '../components/Watchlist';

interface WatchlistViewProps {
  language: Language;
  allTenders: Tender[];
  onSelectTender: (tender: Tender) => void;
}

export function WatchlistView({ language, allTenders, onSelectTender }: WatchlistViewProps) {
  return <Watchlist language={language} allTenders={allTenders} onSelectTender={onSelectTender} />;
}
