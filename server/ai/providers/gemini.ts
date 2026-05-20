/**
 * Gemini AI provider — implements the AIProvider interface.
 *
 * Uses Google's Gemini API (@google/genai) with structured JSON output.
 * The API key is read from process.env.GEMINI_API_KEY (server-side only).
 */

import { GoogleGenAI, Type } from '@google/genai';
import { AIProvider, RawExtraction, TenderSummaryInput } from '../provider.js';
import { PDF_EXTRACTION_PROMPT, buildSummarizationPrompt } from '../prompts.js';
import { logger } from '../../lib/logger.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export class GeminiProvider implements AIProvider {
  readonly name = 'gemini';
  private ai: GoogleGenAI;
  private model: string;

  constructor(apiKey?: string, model?: string) {
    const key = apiKey ?? process.env.GEMINI_API_KEY ?? '';
    if (!key) {
      logger.warn('[GeminiProvider] No GEMINI_API_KEY set — AI features will fail at runtime.');
    }
    this.ai = new GoogleGenAI({ apiKey: key });
    this.model = model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  }

  async extractTendersFromPdf(pdfChunkBase64: string, context: string): Promise<RawExtraction[]> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [
        {
          parts: [
            { text: `${PDF_EXTRACTION_PROMPT}\n\nCONTEXT: ${context}` },
            { inlineData: { mimeType: 'application/pdf', data: pdfChunkBase64 } },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              organizationNameAr: {
                type: Type.STRING,
                description: 'Full Arabic name of the government entity',
              },
              organizationNameEn: {
                type: Type.STRING,
                description: 'English translation of the entity',
              },
              tenderNo: {
                type: Type.STRING,
                description: 'The unique tender/practice reference number',
              },
              type: { type: Type.STRING, description: 'Type: مناقصة, ممارسة, etc.' },
              description: {
                type: Type.STRING,
                description: 'Complete scope of work or announcement details',
              },
              publishingDate: { type: Type.STRING },
              closingDate: { type: Type.STRING },
              pretenderMeeting: { type: Type.STRING },
              page: { type: Type.STRING },
              statusAr: {
                type: Type.STRING,
                description: 'Status in Arabic: طرح جديد, تأجيل, إلخ',
              },
            },
            required: [
              'organizationNameAr',
              'organizationNameEn',
              'tenderNo',
              'description',
              'statusAr',
            ],
          },
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error(
        'Gemini returned an empty response — the content may have been blocked by safety filters.',
      );
    }
    return JSON.parse(text) as RawExtraction[];
  }

  async summarizeTender(input: TenderSummaryInput): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.model,
      contents: [{ parts: [{ text: buildSummarizationPrompt(input) }] }],
    });
    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty response for summarization.');
    }
    return text;
  }
}
