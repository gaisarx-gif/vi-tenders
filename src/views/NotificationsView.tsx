import type { Language } from '../lib/translations';
import { SmartAlerts } from '../components/SmartAlerts';

interface NotificationsViewProps {
  language: Language;
}

export function NotificationsView({ language }: NotificationsViewProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
      <SmartAlerts language={language} />
    </div>
  );
}
