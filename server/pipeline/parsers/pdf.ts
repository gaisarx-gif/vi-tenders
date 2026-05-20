/**
 * PDF parser — splits a PDF into chunks and delegates extraction to the
 * AI provider via the AIProvider interface.
 *
 * Uses pdf-lib for chunk splitting and Node Buffer for base64 conversion
 * (avoids the browser btoa() stack overflow on large arrays).
 */

import { PDFDocument } from 'pdf-lib';
import { AIProvider, RawExtraction } from '../../ai/provider.js';

const CHUNK_SIZE = 15; // pages per AI request

export interface PdfParseResult {
  extractions: RawExtraction[];
  pageCount: number;
  chunkCount: number;
}

export async function parsePdf(
  fileBase64: string,
  context: string,
  aiProvider: AIProvider,
): Promise<PdfParseResult> {
  const buffer = Buffer.from(fileBase64, 'base64');
  const pdfDoc = await PDFDocument.load(buffer);
  const pageCount = pdfDoc.getPageCount();

  const chunks: Uint8Array[] = [];
  for (let i = 0; i < pageCount; i += CHUNK_SIZE) {
    const newPdf = await PDFDocument.create();
    const end = Math.min(i + CHUNK_SIZE, pageCount);
    const pages = await newPdf.copyPages(
      pdfDoc,
      Array.from({ length: end - i }, (_, k) => i + k),
    );
    pages.forEach((p) => newPdf.addPage(p));
    chunks.push(await newPdf.save());
  }

  const allExtractions: RawExtraction[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkBase64 = Buffer.from(chunks[i]).toString('base64');
    const chunkExtractions = await aiProvider.extractTendersFromPdf(chunkBase64, context);
    allExtractions.push(...chunkExtractions);
  }

  return {
    extractions: allExtractions,
    pageCount,
    chunkCount: chunks.length,
  };
}
