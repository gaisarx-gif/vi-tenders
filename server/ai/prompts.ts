/**
 * Prompt templates used by AI providers.
 *
 * Separated from provider implementations so prompts can be iterated
 * independently of model-specific code.
 */

import { TenderSummaryInput } from './provider.js';

export const PDF_EXTRACTION_PROMPT = `You are a specialized AI for analyzing the "Kuwait Today" (الكويت اليوم) official gazette. Your goal is to extract tender announcements with 100% accuracy.

CONTEXTUAL UNDERSTANDING:
- The gazette is organized by GOVERNMENT ENTITIES (Headers). An entity name appears once, and all subsequent tenders belong to it until a new entity header is found.
- Tenders can be: "مناقصة" (Tender), "ممارسة" (Practice), "مزايدة" (Auction), "إلغاء" (Cancellation), "تأجيل" (Postponement), or "تنويه" (Notice).

KEYWORD STRATEGY:
- PRIMARY KEYWORDS (Type Detection): [مناقصة, ممارسة, مزايدة, إلغاء, تأجيل, تمديد, إعادة طرح, تنويه, دعوة].
- SECONDARY KEYWORDS (Description Context): [توريد, إنشاء, صيانة, تقديم خدمات, استشارات, ترميم, تشغيل, تنفيذ, شراء].
- TENDER NUMBER PATTERNS: Look for codes like (هـ ص/12/2024) or (و أ/م/5/2023-2024).

EXTRACTION RULES:
1. ORGANIZATION NAME: Capture the full official name (e.g., "وزارة الكهرباء والماء والطاقة المتجددة").
2. TENDER NUMBER: Extract the exact alphanumeric code. Do not omit slashes or years.
3. DESCRIPTION: Capture the COMPLETE scope of work. If it starts with "توريد..." or "إنشاء...", include the entire sentence until the next field or announcement.
4. STATUS:
   - If "إعادة طرح" -> "Re-announcement"
   - If "تأجيل" or "تمديد" -> "Postponed"
   - If "تنويه" or "تعديل" -> "Advance Notice"
   - Otherwise -> "New Tender"

FEW-SHOT EXAMPLES:
Example 1:
Input: "وزارة الأشغال العامة - مناقصة رقم هـ ص/150 - صيانة الطرق السريعة - الإغلاق 15/6/2024"
Output: {"organizationNameAr": "وزارة الأشغال العامة", "organizationNameEn": "Ministry of Public Works", "tenderNo": "هـ ص/150", "description": "صيانة الطرق السريعة", "statusAr": "طرح جديد"}

Example 2:
Input: "بلدية الكويت - تنويه بشأن ممارسة رقم ب ك/5/2023 لتنظيف المباني - تم تغيير موعد الاجتماع التمهيدي"
Output: {"organizationNameAr": "بلدية الكويت", "organizationNameEn": "Kuwait Municipality", "tenderNo": "ب ك/5/2023", "description": "تنويه بشأن تنظيف المباني - تغيير موعد الاجتماع التمهيدي", "statusAr": "تنويه"}

CRITICAL: Return ONLY a JSON array. If a value is unclear, use "N/C". Ensure Arabic text is preserved correctly.`;

export function buildSummarizationPrompt(input: TenderSummaryInput): string {
  return `Summarize the following tender in a professional, concise way.
Provide key highlights, requirements, and any critical dates.
The summary should be in the language of the description (Arabic or English).

Tender Details:
Organization: ${input.organizationNameAr} / ${input.organizationNameEn}
Number: ${input.tenderNo}
Description: ${input.description}
Closing Date: ${input.closingDate}`;
}
