import type { TenderIssue, Tender } from '../types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, Plus, FileText } from 'lucide-react';
import { ReviewTable } from '../components/ReviewTable';

interface AnalysisViewProps {
  issues: TenderIssue[];
  reviewTenders: Tender[] | null;
  setReviewTenders: (tenders: Tender[] | null) => void;
  issueNumber: string;
  setIssueNumber: (n: string) => void;
  issueDate: string;
  setIssueDate: (d: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadMessage: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onConfirmReview: (tenders: Tender[]) => void;
  setActiveTab: (tab: string) => void;
}

export function AnalysisView({
  issues,
  reviewTenders,
  setReviewTenders,
  issueNumber,
  setIssueNumber,
  issueDate,
  setIssueDate,
  isUploading,
  uploadProgress,
  uploadMessage,
  onFileUpload,
  onConfirmReview,
  setActiveTab,
}: AnalysisViewProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Documents Center</h2>
        <Button
          onClick={() => setReviewTenders(null)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" /> New Analysis
        </Button>
      </div>

      {reviewTenders ? (
        <ReviewTable
          tenders={reviewTenders}
          onConfirm={onConfirmReview}
          onCancel={() => setReviewTenders(null)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 bg-card border-none p-6 space-y-6">
            <h3 className="text-lg font-bold text-foreground">Analyze New Gazette</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Issue Number</Label>
                <Input
                  placeholder="e.g. 1650"
                  value={issueNumber}
                  onChange={(e) => setIssueNumber(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Issue Date</Label>
                <Input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={onFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploading}
                />
                <div
                  className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all ${
                    isUploading
                      ? 'bg-accent/50 border-border'
                      : 'border-border group-hover:border-primary group-hover:bg-primary/5'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-4 w-full max-w-[200px]">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-center text-muted-foreground">
                        {uploadMessage}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground text-center">
                        Click or drag PDF to analyze
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-2 bg-card border-none overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Processed Gazettes</h3>
            </div>
            <div className="divide-y divide-border">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Issue #{issue.issueNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">{issue.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('overview')}>
                      View Tenders
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
              {issues.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  No gazettes processed yet.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
