import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, FileSpreadsheet, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UploadPanelProps {
  role?: string | null;
}

export function UploadPanel({ role }: UploadPanelProps) {
  if (role !== 'admin') return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Upload & Import</h2>
      <PdfUploadSection />
      <ExcelUploadSection />
    </div>
  );
}

function PdfUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [issueNumber, setIssueNumber] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ ok: boolean; processed?: number; pageCount?: number; error?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
  };

  const handleSubmit = async () => {
    if (!file || !issueNumber || !date) return;
    setLoading(true);
    setProgress(30);
    setResult(null);

    try {
      setProgress(60);
      const form = new FormData();
      form.append('file', file);
      form.append('issueNumber', issueNumber);
      form.append('date', date);

      const res = await fetch('/api/ingest/pdf', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      setProgress(90);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || err.details || 'Upload failed');
      }

      const data = await res.json();
      setProgress(100);
      setResult({ ok: true, processed: data.processed, pageCount: data.pageCount });
      toast.success(`Processed ${data.processed} tenders`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setResult({ ok: false, error: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setIssueNumber('');
    setDate('');
    setProgress(0);
    setResult(null);
  };

  return (
    <Card className="bg-card border-none rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          PDF Extraction
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload a Kuwait Today gazette PDF to extract tenders automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Issue Number
            </Label>
            <Input
              value={issueNumber}
              onChange={(e) => setIssueNumber(e.target.value)}
              placeholder="e.g. 1724"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Issue Date
            </Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="space-y-2">
              <FileText className="h-10 w-10 mx-auto text-primary" />
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Drop PDF here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports .pdf up to 50MB</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 ${
            result.ok ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
          }`}>
            {result.ok ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <XCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            <div>
              <p className="text-sm font-bold">{result.ok ? 'Processing Complete' : 'Processing Failed'}</p>
              <p className="text-xs mt-1">
                {result.ok
                  ? `Processed ${result.processed} tenders across ${result.pageCount} pages.`
                  : result.error}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!file || !issueNumber || !date || loading}
            className="flex-1 h-12 text-base font-bold"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FileText className="h-5 w-5 mr-2" />}
            {loading ? 'Extracting...' : 'Extract Tenders'}
          </Button>
          {result && (
            <Button variant="outline" onClick={reset} className="h-12 px-6">
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ExcelUploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; imported?: number; skipped?: number; error?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const EXCEL_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && EXCEL_TYPES.includes(f.type)) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const form = new FormData();
      form.append('file', file);

      const res = await fetch('/api/ingest/excel', {
        method: 'POST',
        body: form,
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Import failed' }));
        throw new Error(err.error || err.details || 'Import failed');
      }

      const data = await res.json();
      setResult({ ok: true, imported: data.imported, skipped: data.skipped });
      toast.success(`Imported ${data.imported} records${data.skipped ? ` (${data.skipped} skipped)` : ''}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed';
      setResult({ ok: false, error: msg });
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  return (
    <Card className="bg-card border-none rounded-xl overflow-hidden">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileSpreadsheet className="h-6 w-6 text-primary" />
          Excel Import
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Import tenders from an Excel file (.xlsx, .xls).
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            file ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="space-y-2">
              <FileSpreadsheet className="h-10 w-10 mx-auto text-primary" />
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Drop Excel here or click to browse</p>
              <p className="text-xs text-muted-foreground">Supports .xlsx, .xls up to 10MB</p>
            </div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Importing...</span>
          </div>
        )}

        {result && (
          <div className={`p-4 rounded-2xl flex items-start gap-3 ${
            result.ok ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'
          }`}>
            {result.ok ? <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
            <div>
              <p className="text-sm font-bold">{result.ok ? 'Import Complete' : 'Import Failed'}</p>
              <p className="text-xs mt-1">
                {result.ok
                  ? `Imported ${result.imported} records${result.skipped ? ` (${result.skipped} skipped)` : ''}.`
                  : result.error}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="flex-1 h-12 text-base font-bold"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <FileSpreadsheet className="h-5 w-5 mr-2" />}
            {loading ? 'Importing...' : 'Import'}
          </Button>
          {result && (
            <Button variant="outline" onClick={reset} className="h-12 px-6">
              Reset
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
