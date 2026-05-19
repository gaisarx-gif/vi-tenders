import { describe, it, expect } from 'vitest';
import { enrich } from '../../server/pipeline/enricher.js';
import type { NormalizedTender } from '../../server/pipeline/validator.js';

function makeTender(overrides: Partial<NormalizedTender> = {}): NormalizedTender {
  return {
    organizationNameAr: 'وزارة الصحة',
    organizationNameEn: 'Ministry of Health',
    tenderNo: 'ص/123',
    description: 'توريد أدوية',
    publishingDate: '',
    closingDate: '2026-06-15',
    pretenderMeeting: '',
    page: '',
    status: 'New Tender',
    statusAr: 'طرح جديد',
    statusEn: 'New Tender',
    ...overrides,
  };
}

describe('enrich', () => {
  it('adds id, canonicalOrgId, createdAt, source, dataSource', () => {
    const result = enrich([makeTender()], 'PDF_ANALYSIS', 'Issue 1234');
    expect(result).toHaveLength(1);
    const t = result[0];
    expect(t.id).toBeTruthy();
    expect(t.canonicalOrgId).toBe('وزارة_الصحة');
    expect(t.createdAt).toBeGreaterThan(0);
    expect(t.dataSource).toBe('PDF_ANALYSIS');
    expect(t.source).toBe('Issue 1234');
  });

  it('maps status to Arabic correctly', () => {
    const result = enrich([makeTender({ status: 'Postponed', statusAr: '', statusEn: '' })], 'MANUAL_ENTRY', '');
    expect(result[0].statusAr).toBe('تأجيل');
    expect(result[0].statusEn).toBe('Postponed');
  });

  it('generates unique ids for each tender', () => {
    const result = enrich([makeTender(), makeTender({ tenderNo: 'ص/124' })], 'EXCEL_IMPORT', '');
    expect(result[0].id).not.toBe(result[1].id);
  });

  it('falls back for unknown org name', () => {
    const t = makeTender({ organizationNameAr: '' });
    const result = enrich([t], 'MANUAL_ENTRY', '');
    expect(result[0].canonicalOrgId).toBe('جهة_غير_معروفة');
    expect(result[0].organizationName).toBe('جهة غير معروفة');
  });
});
