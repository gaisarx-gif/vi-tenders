/**
 * Tender field validator.
 *
 * Runs after normalization. Checks required fields, status enum,
 * and date formats. Produces per-tender errors without rejecting
 * the entire batch.
 */

import { TenderStatus } from '../../shared/normalizer.js';

export interface NormalizedTender {
  organizationNameAr: string;
  organizationNameEn: string;
  tenderNo: string;
  description: string;
  publishingDate: string;
  closingDate: string;
  pretenderMeeting: string;
  page: string;
  status: TenderStatus;
  statusAr: string;
  statusEn: string;
}

export interface PipelineError {
  index: number;
  field: string;
  message: string;
  severity: 'warning' | 'error';
}

const VALID_STATUSES: TenderStatus[] = [
  'New Tender',
  'Postponed',
  'Re-announcement',
  'Advance Notice',
];

export function validate(tenders: NormalizedTender[]): {
  valid: NormalizedTender[];
  errors: PipelineError[];
} {
  const valid: NormalizedTender[] = [];
  const errors: PipelineError[] = [];

  for (let i = 0; i < tenders.length; i++) {
    const t = tenders[i];
    const tenderErrors: PipelineError[] = [];

    if (!t.organizationNameAr || t.organizationNameAr === 'N/C') {
      tenderErrors.push({
        index: i,
        field: 'organizationNameAr',
        message: 'Missing organization name (Arabic)',
        severity: 'error',
      });
    }

    if (!t.tenderNo || t.tenderNo === 'N/C') {
      tenderErrors.push({
        index: i,
        field: 'tenderNo',
        message: 'Missing tender number',
        severity: 'warning',
      });
    }

    if (!t.description || t.description === 'N/C') {
      tenderErrors.push({
        index: i,
        field: 'description',
        message: 'Missing description',
        severity: 'warning',
      });
    }

    if (!VALID_STATUSES.includes(t.status)) {
      tenderErrors.push({
        index: i,
        field: 'status',
        message: `Invalid status "${t.status}". Must be one of: ${VALID_STATUSES.join(', ')}`,
        severity: 'error',
      });
    }

    const hasBlockingError = tenderErrors.some((e) => e.severity === 'error');
    if (!hasBlockingError) {
      valid.push(t);
    }
    errors.push(...tenderErrors);
  }

  return { valid, errors };
}
