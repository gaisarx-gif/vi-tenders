import { describe, it, expect } from 'vitest';
import { normalizeStatus, normalizeOrgName, STATUS_TO_AR } from '../../shared/normalizer.js';

describe('normalizeStatus', () => {
  it('maps Arabic "طرح جديد" to New Tender', () => {
    expect(normalizeStatus('طرح جديد')).toBe('New Tender');
  });

  it('maps English "postponed" to Postponed', () => {
    expect(normalizeStatus('postponed')).toBe('Postponed');
  });

  it('maps "إعادة طرح" to Re-announcement', () => {
    expect(normalizeStatus('إعادة طرح')).toBe('Re-announcement');
  });

  it('maps "تنويه" to Advance Notice', () => {
    expect(normalizeStatus('تنويه')).toBe('Advance Notice');
  });

  it('defaults unknown status to New Tender', () => {
    expect(normalizeStatus('Unknown Status')).toBe('New Tender');
  });

  it('handles empty string', () => {
    expect(normalizeStatus('')).toBe('New Tender');
  });

  it('is case-insensitive', () => {
    expect(normalizeStatus('NEW TENDER')).toBe('New Tender');
    expect(normalizeStatus('PostPoned')).toBe('Postponed');
  });
});

describe('normalizeOrgName', () => {
  it('normalizes common spelling errors', () => {
    const result = normalizeOrgName('وزاره الكهرباء', '');
    expect(result.canonicalAr).toBe('وزارة الكهرباء والماء والطاقة المتجددة');
    expect(result.canonicalEn).toBe('Ministry of Electricity, Water and Renewable Energy');
  });

  it('returns unknown entity for unrecognized names', () => {
    const result = normalizeOrgName('جهة غير معروفة', '');
    expect(result.canonicalAr).toBe('جهة غير معروفة');
    expect(result.canonicalEn).toBe('Unknown Entity');
  });

  it('handles empty input', () => {
    const result = normalizeOrgName('', '');
    expect(result.canonicalAr).toBe('جهة غير معروفة');
  });

  it('matches English name', () => {
    const result = normalizeOrgName('', 'Ministry of Health');
    expect(result.canonicalAr).toBe('وزارة الصحة');
    expect(result.canonicalEn).toBe('Ministry of Health');
  });
});

describe('STATUS_TO_AR', () => {
  it('contains all four status mappings', () => {
    expect(STATUS_TO_AR['New Tender']).toBe('طرح جديد');
    expect(STATUS_TO_AR.Postponed).toBe('تأجيل');
    expect(STATUS_TO_AR['Re-announcement']).toBe('إعادة طرح');
    expect(STATUS_TO_AR['Advance Notice']).toBe('تنويه');
  });
});
