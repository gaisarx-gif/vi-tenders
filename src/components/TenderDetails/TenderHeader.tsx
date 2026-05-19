import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tender } from '../../types';
import { Language } from '../../lib/translations';
import { ArrowLeft, Bell, BellOff, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TenderHeaderProps {
  tender: Tender;
  language: Language;
  userRole?: 'admin' | 'user' | null;
  t: Record<string, string>;
  isSubscribedToTender: boolean;
  isSubscribing: boolean;
  onBack: () => void;
  onSubscribe: (targetId: string, type: 'tender' | 'organization') => void;
  onStatusUpdate: (status: string, statusAr: string, statusEn: string) => void;
}

export function TenderHeader({
  tender,
  language,
  userRole,
  t,
  isSubscribedToTender,
  isSubscribing,
  onBack,
  onSubscribe,
  onStatusUpdate,
}: TenderHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
        <ArrowLeft className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
      </Button>
      <div>
        <h2 className="text-2xl font-black text-slate-900">{tender.tenderNo}</h2>
        <p className="text-slate-500 font-medium">
          {language === 'ar'
            ? tender.organizationNameAr || tender.organizationName
            : tender.organizationNameEn || tender.organizationName}
        </p>
      </div>
      <div className="flex items-center gap-2 mr-auto">
        {userRole === 'admin' ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" className="rounded-full gap-2 border-slate-200" />
              }
            >
              <Badge
                className={`border-none px-4 py-1 rounded-full font-bold ${
                  tender.statusEn === 'New Tender' || tender.status === 'New Tender'
                    ? 'bg-blue-100 text-blue-600'
                    : tender.statusEn === 'Postponed' || tender.status === 'Postponed'
                      ? 'bg-amber-100 text-amber-600'
                      : tender.statusEn === 'Re-announcement' ||
                          tender.status === 'Re-announcement'
                        ? 'bg-purple-100 text-purple-600'
                        : tender.statusEn === 'Advance Notice' ||
                            tender.status === 'Advance Notice'
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-100 text-slate-600'
                }`}
              >
                {language === 'ar'
                  ? tender.statusAr || tender.status
                  : tender.statusEn || tender.status}
              </Badge>
              <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl p-2">
              <DropdownMenuItem
                onClick={() => onStatusUpdate('New Tender', 'طرح جديد', 'New Tender')}
                className="rounded-xl gap-2"
              >
                <Badge className="bg-blue-100 text-blue-600 border-none">{t.newTender}</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusUpdate('Postponed', 'تأجيل', 'Postponed')}
                className="rounded-xl gap-2"
              >
                <Badge className="bg-amber-100 text-amber-600 border-none">{t.postponed}</Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  onStatusUpdate('Re-announcement', 'إعادة طرح', 'Re-announcement')
                }
                className="rounded-xl gap-2"
              >
                <Badge className="bg-purple-100 text-purple-600 border-none">
                  {t.reAnnouncement}
                </Badge>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onStatusUpdate('Advance Notice', 'تنويه', 'Advance Notice')}
                className="rounded-xl gap-2"
              >
                <Badge className="bg-emerald-100 text-emerald-600 border-none">
                  {t.advanceNotice}
                </Badge>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Badge
            className={`border-none px-4 py-1 rounded-full font-bold ${
              tender.statusEn === 'New Tender' || tender.status === 'New Tender'
                ? 'bg-blue-100 text-blue-600'
                : tender.statusEn === 'Postponed' || tender.status === 'Postponed'
                  ? 'bg-amber-100 text-amber-600'
                  : tender.statusEn === 'Re-announcement' || tender.status === 'Re-announcement'
                    ? 'bg-purple-100 text-purple-600'
                    : tender.statusEn === 'Advance Notice' || tender.status === 'Advance Notice'
                      ? 'bg-emerald-100 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
            }`}
          >
            {language === 'ar'
              ? tender.statusAr || tender.status
              : tender.statusEn || tender.status}
          </Badge>
        )}

        <Button
          variant="outline"
          size="sm"
          className={`rounded-full gap-2 border-slate-200 ${isSubscribedToTender ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
          onClick={() => onSubscribe(tender.id, 'tender')}
          disabled={isSubscribing}
        >
          {isSubscribedToTender ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {isSubscribedToTender ? t.unsubscribe : t.subscribe}
        </Button>
      </div>
    </div>
  );
}
