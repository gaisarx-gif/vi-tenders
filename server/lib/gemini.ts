import { GoogleGenAI } from '@google/genai';
import { logger } from './logger.ts';

export interface ExtractedTender {
  organizationName: string;
  tenderNo: string;
  description: string;
  publishingDate: string;
  closingDate: string;
  pretenderMeeting?: string;
  status: 'New Tender' | 'Postponed' | 'Re-announcement' | 'Advance Notice';
  page?: string;
}

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  if (process.env.NODE_ENV === 'production') {
    logger.error('GEMINI_API_KEY is required in production');
    process.exit(1);
  }
  logger.warn('GEMINI_API_KEY not set — AI features will fail at runtime.');
}

const ai = new GoogleGenAI({ apiKey: API_KEY || '' });

const EXTRACTION_PROMPT = `You are an expert at parsing Arabic government tender announcements from "Kuwait Today" (الكويت اليوم) gazette.

Extract the tender information from the following Arabic text and return ONLY a valid JSON array. Do NOT include markdown code blocks, backticks, or any other text — only the raw JSON array.

Each object in the array must have exactly these fields:
- organizationName: string (the government entity name in Arabic)
- tenderNo: string (the tender reference number)
- description: string (description of the tender scope)
- publishingDate: string (date in yyyy-mm-dd format)
- closingDate: string (date in yyyy-mm-dd format)
- pretenderMeeting: string (optional, pre-tender meeting date or description)
- status: string (one of: "New Tender", "Postponed", "Re-announcement", "Advance Notice")
- page: string (optional, the page number in the gazette)

If no tenders are found, return an empty array [].`;

export async function extractTendersFromText(text: string): Promise<ExtractedTender[]> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ parts: [{ text: `${EXTRACTION_PROMPT}\n\n---\n${text}` }] }],
    });

    const raw = response.text;
    if (!raw) {
      logger.warn('[extractTendersFromText] Gemini returned empty response');
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      logger.warn('[extractTendersFromText] Response is not an array');
      return [];
    }

    return parsed as ExtractedTender[];
  } catch (err) {
    logger.warn('[extractTendersFromText] Failed to parse Gemini response: %s', err instanceof Error ? err.message : String(err));
    return [];
  }
}
