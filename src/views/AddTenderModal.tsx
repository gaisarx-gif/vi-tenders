import { useState } from 'react';
import type { Language } from '../lib/translations';
import type { Tender } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddTenderModalProps {
  open: boolean;
  language: Language;
  onClose: () => void;
  onCreated?: () => void;
}

const initialState: Partial<Tender> = {
  organizationNameAr: '',
  organizationNameEn: '',
  tenderNo: '',
  description: '',
  publishingDate: new Date().toISOString().split('T')[0],
  closingDate: '',
  statusAr: 'طرح جديد',
  statusEn: 'New Tender',
};

export function AddTenderModal({ open, language, onClose, onCreated }: AddTenderModalProps) {
  const [data, setData] = useState<Partial<Tender>>(initialState);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!data.organizationNameAr || !data.tenderNo) {
      toast.error('Please fill in the required fields.');
      return;
    }

    try {
      const response = await fetch('/api/tenders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          organizationName: data.organizationNameAr || '',
          status: data.statusEn || 'New Tender',
        }),
      });

      if (response.ok) {
        setData(initialState);
        toast.success('Tender added successfully!');
        onCreated?.();
        onClose();
      } else {
        toast.error('Failed to add tender');
      }
    } catch (error) {
      console.error('Error adding tender:', error);
      toast.error('Failed to add tender');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card border-none rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <CardHeader className="border-b border-border p-8">
          <CardTitle className="text-2xl font-black text-foreground flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            {language === 'ar' ? 'إضافة مناقصة يدوياً' : 'Add Tender Manually'}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            {language === 'ar'
              ? 'أدخل تفاصيل المناقصة الجديدة في النظام'
              : 'Enter the details of the new tender into the system'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {language === 'ar' ? 'اسم الجهة (عربي)' : 'Organization Name (Arabic)'}
              </Label>
              <Input
                value={data.organizationNameAr}
                onChange={(e) => setData({ ...data, organizationNameAr: e.target.value })}
                placeholder="e.g. وزارة الصحة"
                className="bg-background border-border h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {language === 'ar' ? 'اسم الجهة (إنجليزي)' : 'Organization Name (English)'}
              </Label>
              <Input
                value={data.organizationNameEn}
                onChange={(e) => setData({ ...data, organizationNameEn: e.target.value })}
                placeholder="e.g. Ministry of Health"
                className="bg-background border-border h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {language === 'ar' ? 'رقم المناقصة' : 'Tender Number'}
              </Label>
              <Input
                value={data.tenderNo}
                onChange={(e) => setData({ ...data, tenderNo: e.target.value })}
                placeholder="e.g. KM/123/2024"
                className="bg-background border-border h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {language === 'ar' ? 'تاريخ الإغلاق' : 'Closing Date'}
              </Label>
              <Input
                type="date"
                value={data.closingDate}
                onChange={(e) => setData({ ...data, closingDate: e.target.value })}
                className="bg-background border-border h-12 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {language === 'ar' ? 'الوصف' : 'Description'}
            </Label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              className="w-full min-h-[120px] rounded-xl border border-border bg-background p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Describe the tender scope..."
            />
          </div>
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleSubmit}
              className="flex-1 h-14 rounded-2xl bg-primary text-white font-black text-lg shadow-xl shadow-primary/20"
            >
              {language === 'ar' ? 'حفظ المناقصة' : 'Save Tender'}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="h-14 px-8 rounded-2xl text-muted-foreground font-bold"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
