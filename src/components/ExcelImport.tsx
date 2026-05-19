import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

import { translations } from '../lib/translations';

interface ExcelImportProps {
  /**
   * Called with the base64-encoded file contents. The parent posts these
   * to `/api/ingest/excel`, which runs the file through the canonical
   * parse → normalize → validate → enrich pipeline.
   */
  onFileSelected: (fileBase64: string) => Promise<void>;
}

export function ExcelImport({ onFileSelected }: ExcelImportProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const result = evt.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Unexpected file reader result');
        }
        // Strip the data URL prefix to get the raw base64 payload.
        const base64 = result.includes(',') ? result.split(',', 2)[1] : result;
        await onFileSelected(base64);
      } catch (err) {
        console.error(err);
        toast.error('Failed to read Excel file.');
      } finally {
        setIsProcessing(false);
        // Reset the input so re-uploading the same file works.
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read Excel file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const downloadTemplate = () => {
    const template = [
      {
        NO: '1',
        Tender_ID: 'KM/123/2024',
        Entity: 'Example Ministry',
        Description: 'Supply of office equipment',
        Announcement_Date: '11/04/2024',
        Deadline: '11/05/2024',
        Meeting_Date: '20/04/2024',
        Source: 'Internal',
        'Page / Ref': '1',
        Status: 'New Tender',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'tender_import_template.xlsx');
  };

  return (
    <Card className="border-dashed border-2 rounded-[24px] border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-black">
          <FileSpreadsheet className="h-6 w-6 text-secondary" />
          {translations.en.excelImport}
        </CardTitle>
        <CardDescription className="font-medium">
          Import tenders from an Excel file. Use our template for best results.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <Download className="h-4 w-4 text-slate-400" />
            Need a template?
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
            className="rounded-full px-4 border-slate-200"
          >
            Download Template
          </Button>
        </div>

        <div className="relative group">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={isProcessing}
          />
          <div
            className={`
            border-2 border-dashed rounded-[20px] p-12 flex flex-col items-center justify-center gap-4 transition-all
            ${isProcessing ? 'bg-slate-50 border-slate-300' : 'border-secondary/20 group-hover:border-secondary group-hover:bg-secondary/5'}
          `}
          >
            <div
              className={`p-4 rounded-full bg-secondary/10 text-secondary transition-transform group-hover:scale-110`}
            >
              <Upload className={`h-8 w-8 ${isProcessing ? 'animate-bounce' : ''}`} />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-900">Click to upload Excel file</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">Supports .xlsx, .xls, .csv</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
