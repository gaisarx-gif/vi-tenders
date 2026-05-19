import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Language } from '../../lib/translations';
import { FileText, Plus, Download, Trash2, Upload } from 'lucide-react';

interface Document {
  name: string;
  url: string;
  size: string;
}

interface TenderDocumentsProps {
  documents: Document[];
  language: Language;
  t: Record<string, string>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveDocument: (index: number) => void;
}

export function TenderDocuments({
  documents,
  language,
  t,
  onFileUpload,
  onRemoveDocument,
}: TenderDocumentsProps) {
  return (
    <Card className="rounded-[24px] border-slate-100 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-black flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {t.documents}
        </CardTitle>
        <div className="relative">
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onFileUpload}
          />
          <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200">
            <Plus className="h-4 w-4" />
            {language === 'ar' ? 'إضافة' : 'Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {documents.length > 0 ? (
          documents.map((doc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate max-w-[120px]">
                    {doc.name}
                  </div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {doc.size}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8"
                  render={<a href={doc.url} download={doc.name} />}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onRemoveDocument(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
            <Upload className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {language === 'ar' ? 'لا توجد مستندات' : 'No documents'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
