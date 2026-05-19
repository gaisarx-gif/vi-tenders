import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Language } from '../../lib/translations';
import { FileText, Sparkles, Loader2 } from 'lucide-react';

interface TenderDescriptionProps {
  description: string;
  aiSummary: string | null;
  isSummarizing: boolean;
  language: Language;
  t: Record<string, string>;
  onSummarize: () => void;
  onDismissSummary: () => void;
}

export function TenderDescription({
  description,
  aiSummary,
  isSummarizing,
  language,
  t,
  onSummarize,
  onDismissSummary,
}: TenderDescriptionProps) {
  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {t.description}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 leading-relaxed text-lg font-medium">
          {description}
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100">
          {!aiSummary ? (
            <Button
              onClick={onSummarize}
              disabled={isSummarizing}
              variant="outline"
              className="rounded-xl gap-2 border-primary/20 text-primary hover:bg-primary/5"
            >
              {isSummarizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {language === 'ar' ? 'توليد ملخص بالذكاء الاصطناعي' : 'Generate AI Summary'}
            </Button>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-black uppercase tracking-widest">
                  {language === 'ar' ? 'ملخص الذكاء الاصطناعي' : 'AI Summary'}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                {aiSummary}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismissSummary}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary"
              >
                {language === 'ar' ? 'تحديث' : 'Regenerate'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
