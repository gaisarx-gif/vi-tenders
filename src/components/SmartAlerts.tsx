import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, CheckCircle2, Calendar } from 'lucide-react';
import { Language, translations } from '../lib/translations';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useNotifications } from '../../hooks/use-notifications';

interface SmartAlertsProps {
  language: Language;
}

export function SmartAlerts({ language }: SmartAlertsProps) {
  const t = translations[language];
  const { notifications, unreadCount, markAsRead } = useNotifications(true);

  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-secondary" />
          <span className="text-xs font-black uppercase tracking-widest text-slate-900">
            {t.smartAlerts}
          </span>
        </div>
        {unreadCount > 0 && (
          <Badge className="bg-secondary/10 text-secondary hover:bg-secondary/20 border-none text-[10px]">
            {unreadCount} {language === 'ar' ? 'تنبيهات جديدة' : 'New Alerts'}
          </Badge>
        )}
      </div>
      <div className="p-4 flex flex-col gap-4">
        {notifications.length > 0 ? (
          notifications.map((alert) => (
            <div
              key={alert.id}
              onClick={() => !alert.read && markAsRead(alert.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${
                alert.read
                  ? 'bg-slate-50 border-slate-100 opacity-60'
                  : 'bg-white border-primary/20 shadow-sm'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  alert.type === 'status_change'
                    ? 'bg-amber-100 text-amber-600'
                    : alert.type === 'new_tender'
                      ? 'bg-emerald-100 text-emerald-600'
                      : alert.type === 'calendar_event'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-slate-100 text-slate-600'
                }`}
              >
                {alert.type === 'status_change' ? (
                  <Clock className="h-5 w-5" />
                ) : alert.type === 'calendar_event' ? (
                  <Calendar className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900">{alert.title}</div>
                <div className="text-xs text-slate-500 font-medium">{alert.message}</div>
              </div>
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter whitespace-nowrap">
                {formatDistanceToNow(alert.createdAt, {
                  addSuffix: true,
                  locale: language === 'ar' ? ar : enUS,
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-xs text-slate-400 font-medium italic">
            {language === 'ar' ? 'لا توجد تنبيهات حالياً' : 'No alerts at the moment'}
          </div>
        )}
      </div>
    </Card>
  );
}
