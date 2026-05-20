/**
 * Rule-based tender enricher.
 *
 * Runs after validation. Adds computed fields:
 * - canonicalOrgId (derived from canonical Arabic name)
 * - unique id
 * - createdAt timestamp
 * - dataSource tag
 * - source context string
 * - statusAr reverse mapping
 *
 * This stage is entirely rule-based. AI-assisted enrichment (if needed
 * in the future) should be added as a separate optional step that still
 * goes through the AIProvider interface.
 */

import { NormalizedTender } from './validator.ts';

export type DataSource = 'PDF_ANALYSIS' | 'EXCEL_IMPORT' | 'MANUAL_ENTRY';

export interface EnrichedTender extends NormalizedTender {
  id: string;
  organizationName: string;
  canonicalOrgId: string;
  source: string;
  createdAt: number;
  dataSource: DataSource;
}

import { STATUS_TO_AR } from '../../shared/normalizer.ts';

export function enrich(
  tenders: NormalizedTender[],
  dataSource: DataSource,
  sourceContext: string,
): EnrichedTender[] {
  const now = Date.now();

  return tenders.map((t, index) => {
    const safeCanonicalAr = String(t.organizationNameAr || 'جهة غير معروفة');
    const canonicalOrgId = safeCanonicalAr.toLowerCase().replace(/\s+/g, '_');

    return {
      ...t,
      id: `${dataSource.toLowerCase().replace('_', '-')}-${now}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      organizationName: safeCanonicalAr,
      canonicalOrgId,
      source: sourceContext,
      createdAt: now,
      dataSource,
      statusAr: STATUS_TO_AR[t.status] ?? t.statusAr,
      statusEn: t.status,
    };
  });
}
