/**
 * Unified ingestion pipeline orchestrator.
 *
 * Three entry points (PDF, Excel, Manual) converge into the same
 * Normalize → Validate → Enrich path.
 *
 * The pipeline receives an AIProvider as a parameter — it NEVER
 * imports or references a concrete AI model.
 */

import { AIProvider, RawExtraction } from '../ai/provider.js';
import { parsePdf } from './parsers/pdf.js';
import { parseExcel } from './parsers/excel.js';
import { parseManual, ManualTenderInput } from './parsers/manual.js';
import { normalizeStatus, normalizeOrgName, STATUS_TO_AR, TenderStatus } from '../../shared/normalizer.js';
import { NormalizedTender, PipelineError, validate } from './validator.js';
import { EnrichedTender, DataSource, enrich } from './enricher.js';

export type { PipelineError } from './validator.js';
export type { EnrichedTender } from './enricher.js';

export interface PipelineResult {
  tenders: EnrichedTender[];
  errors: PipelineError[];
  stats: {
    parsed: number;
    normalized: number;
    valid: number;
    skipped: number;
  };
}

// ---------------------------------------------------------------------------
// Stage 2: Normalize
// ---------------------------------------------------------------------------

function normalizeExtractions(raws: RawExtraction[]): NormalizedTender[] {
  return raws.map((r) => {
    const status: TenderStatus = normalizeStatus(r.statusAr ?? '');
    const { canonicalAr, canonicalEn } = normalizeOrgName(
      r.organizationNameAr ?? '',
      r.organizationNameEn ?? '',
    );

    return {
      organizationNameAr: canonicalAr,
      organizationNameEn: canonicalEn,
      tenderNo: r.tenderNo ?? 'N/C',
      description: r.description ?? 'N/C',
      publishingDate: r.publishingDate ?? '',
      closingDate: r.closingDate ?? 'N/C',
      pretenderMeeting: r.pretenderMeeting ?? 'N/C',
      page: r.page ?? 'N/C',
      status,
      statusAr: STATUS_TO_AR[status] ?? r.statusAr ?? '',
      statusEn: status,
    };
  });
}

// ---------------------------------------------------------------------------
// Shared tail: normalize → validate → enrich
// ---------------------------------------------------------------------------

function processExtractions(
  raws: RawExtraction[],
  dataSource: DataSource,
  sourceContext: string,
): PipelineResult {
  const normalized = normalizeExtractions(raws);
  const { valid, errors } = validate(normalized);
  const enriched = enrich(valid, dataSource, sourceContext);

  return {
    tenders: enriched,
    errors,
    stats: {
      parsed: raws.length,
      normalized: normalized.length,
      valid: valid.length,
      skipped: raws.length - valid.length,
    },
  };
}

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------

export async function ingestPdf(
  fileBase64: string,
  issueNumber: string,
  issueDate: string,
  aiProvider: AIProvider,
): Promise<PipelineResult> {
  const context = `Issue ${issueNumber} dated ${issueDate}`;
  const { extractions } = await parsePdf(fileBase64, context, aiProvider);
  return processExtractions(
    extractions,
    'PDF_ANALYSIS',
    `Kuwait Today ${issueNumber} dated ${issueDate}`,
  );
}

export function ingestExcel(fileBase64: string): PipelineResult {
  const raws = parseExcel(fileBase64);
  return processExtractions(
    raws,
    'EXCEL_IMPORT',
    `Excel Import ${new Date().toLocaleDateString()}`,
  );
}

export function ingestManual(input: ManualTenderInput): PipelineResult {
  const raw = parseManual(input);
  return processExtractions([raw], 'MANUAL_ENTRY', input.source ?? 'Manual Entry');
}
