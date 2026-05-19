import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, LucideIcon } from 'lucide-react';

interface TimelineItem {
  label: string;
  value: string | null;
  icon: LucideIcon;
  color: string;
}

interface TenderTimelineProps {
  items: TimelineItem[];
  title: string;
}

export function TenderTimeline({ items, title }: TenderTimelineProps) {
  if (items.length === 0) return null;

  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <History className="h-5 w-5 text-secondary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-100">
          {items.map((item, i) => (
            <div key={i} className="relative flex items-center gap-6">
              <div
                className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white shadow-lg z-10`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {item.label}
                </div>
                <div className="text-sm font-bold text-slate-900">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
