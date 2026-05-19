import { describe, it, expect } from 'vitest';
import { validate } from '../../server/pipeline/validator.js';
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

describe('validate', () => {
  it('passes a valid tender', () => {
    const result = validate([makeTender()]);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects tender with missing org name (error severity)', () => {
    const result = validate([makeTender({ organizationNameAr: 'N/C' })]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].severity).toBe('error');
  });

  it('warns on missing tenderNo but does not reject', () => {
    const result = validate([makeTender({ tenderNo: 'N/C' })]);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].severity).toBe('warning');
  });

  it('rejects invalid status', () => {
    const result = validate([makeTender({ status: 'Invalid' })]);
    expect(result.valid).toHaveLength(0);
    expect(result.errors.some((e) => e.field === 'status')).toBe(true);
  });

  it('handles mixed valid/invalid batch', () => {
    const result = validate([makeTender(), makeTender({ organizationNameAr: 'N/C' })]);
    expect(result.valid).toHaveLength(1);
    expect(result.errors).toHaveLength(1);
  });
});
