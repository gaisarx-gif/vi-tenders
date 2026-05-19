/**
 * Model-agnostic AI provider interface.
 *
 * The pipeline NEVER calls a concrete AI model directly — it interacts
 * exclusively through this interface. New providers (OpenAI, Claude, etc.)
 * implement the same contract and are selected via the AI_PROVIDER env var.
 */

/** Raw extraction output from AI before normalization/validation. */
export interface RawExtraction {
  organizationNameAr?: string;
  organizationNameEn?: string;
  tenderNo?: string;
  type?: string;
  description?: string;
  publishingDate?: string;
  closingDate?: string;
  pretenderMeeting?: string;
  page?: string;
  statusAr?: string;
}

/** Minimal tender data passed to summarization. */
export interface TenderSummaryInput {
  organizationNameAr: string;
  organizationNameEn: string;
  tenderNo: string;
  description: string;
  closingDate: string;
}

export interface AIProvider {
  readonly name: string;

  /**
   * Extract structured tender data from a single PDF chunk (base64-encoded).
   * @param pdfChunkBase64 - base64 string of a PDF chunk (≤15 pages)
   * @param context        - human-readable context (e.g. "Issue 1234 dated 2024-06-01")
   * @returns Array of raw extractions (unnormalized, unvalidated)
   */
  extractTendersFromPdf(pdfChunkBase64: string, context: string): Promise<RawExtraction[]>;

  /**
   * Generate a professional summary of a tender.
   * @returns Markdown summary string
   */
  summarizeTender(input: TenderSummaryInput): Promise<string>;
}
