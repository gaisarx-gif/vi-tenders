import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Building2, FileText, Trash2, ExternalLink } from 'lucide-react';
import { Language } from '../lib/translations';
import { Tender, Subscription } from '../types';

interface WatchlistProps {
  language: Language;
  allTenders: Tender[];
  onSelectTender: (tender: Tender) => void;
}

export function Watchlist({ language, allTenders, onSelectTender }: WatchlistProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data);
      } else if (response.status === 401) {
        console.warn('Unauthorized access to subscriptions');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch subscriptions', {
          status: response.status,
          error: errorData.error,
        });
      }
    } catch (error) {
      console.error('Network error fetching subscriptions', error);
    }
  };

  const handleDeleteSub = async (id: string) => {
    try {
      const response = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchSubscriptions();
      }
    } catch (error) {
      console.error('Failed to delete subscription', error);
    }
  };

  const watchedTenders = subscriptions
    .filter((s) => s.type === 'tender')
    .map((s) => {
      const tender = allTenders.find((t) => t.id === s.targetId);
      return { subId: s.id, tender };
    })
    .filter((item) => item.tender !== undefined);

  const watchedOrgs = subscriptions.filter((s) => s.type === 'organization');

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="rounded-[24px] border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              {language === 'ar' ? 'المناقصات المتابعة' : 'Watched Tenders'}
            </CardTitle>
            <CardDescription>Tenders you are tracking for status updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedTenders.length > 0 ? (
              watchedTenders.map(({ subId, tender }) => (
                <div
                  key={subId}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-sm">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-slate-900 truncate">
                        {tender?.tenderNo}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate">
                        {tender?.organizationName}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => tender && onSelectTender(tender)}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-destructive"
                      onClick={() => handleDeleteSub(subId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm italic">
                No tenders in watchlist.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border-slate-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Building2 className="h-5 w-5 text-secondary" />
              {language === 'ar' ? 'الجهات المتابعة' : 'Watched Organizations'}
            </CardTitle>
            <CardDescription>Organizations you are monitoring for new tenders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {watchedOrgs.length > 0 ? (
              watchedOrgs.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-secondary shadow-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">{sub.targetId}</div>
                      <Badge
                        variant="secondary"
                        className="text-[9px] font-black uppercase tracking-widest bg-secondary/10 text-secondary border-none"
                      >
                        Monitoring
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full text-destructive"
                    onClick={() => handleDeleteSub(sub.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-sm italic">
                No organizations in watchlist.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
