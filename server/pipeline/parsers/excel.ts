/**
 * Excel parser — reads a base64-encoded Excel file and maps rows
 * to RawExtraction[].
 *
 * No AI is needed here — Excel data is already structured.
 * Column name mapping supports both English and Arabic headers.
 */

import * as XLSX from 'xlsx';
import { RawExtraction } from '../../ai/provider.ts';

export function parseExcel(fileBase64: string): RawExtraction[] {
  const buffer = Buffer.from(fileBase64, 'base64');
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

  return rows.map((row) => {
    const s = (key: string): string | undefined =>
      row[key] != null ? String(row[key]) : undefined;
    return {
      organizationNameAr: s('Entity') ?? s('Organization Name') ?? s('اسم الجهة') ?? s('الجهة'),
      organizationNameEn: s('Entity') ?? s('Organization Name'),
      tenderNo: s('Tender_ID') ?? s('Tender No.') ?? s('رقم المناقصة'),
      description: s('Description') ?? s('الوصف'),
      publishingDate: s('Announcement_Date') ?? s('Publishing Date') ?? s('تاريخ النشر'),
      closingDate: s('Deadline') ?? s('Closing Date') ?? s('تاريخ الإغلاق'),
      pretenderMeeting: s('Meeting_Date') ?? s('Pretender Meeting') ?? s('الاجتماع التمهيدي'),
      page: s('Page / Ref') ?? s('The Page') ?? s('رقم الصفحة'),
      statusAr: s('Status') ?? s('الحالة'),
    } satisfies RawExtraction;
  });
}
