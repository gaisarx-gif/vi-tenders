/**
 * Manual entry parser — reshapes a form submission into a RawExtraction.
 *
 * The simplest parser: maps user-provided fields to the pipeline's
 * expected input shape.
 */

import { RawExtraction } from '../../ai/provider.js';

export interface ManualTenderInput {
  organizationNameAr?: string;
  organizationNameEn?: string;
  organizationName?: string;
  tenderNo?: string;
  description?: string;
  publishingDate?: string;
  closingDate?: string;
  pretenderMeeting?: string;
  statusAr?: string;
  statusEn?: string;
  status?: string;
  source?: string;
  page?: string | number;
}

export function parseManual(input: ManualTenderInput): RawExtraction {
  return {
    organizationNameAr: input.organizationNameAr ?? input.organizationName,
    organizationNameEn: input.organizationNameEn,
    tenderNo: input.tenderNo,
    description: input.description,
    publishingDate: input.publishingDate,
    closingDate: input.closingDate,
    pretenderMeeting: input.pretenderMeeting,
    page: input.page != null ? String(input.page) : undefined,
    statusAr: input.statusAr ?? input.status,
  };
}
