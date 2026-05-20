import { PDFDocument } from 'pdf-lib';
import { extractTendersFromText, type ExtractedTender } from './gemini.ts';
import { logger } from './logger.ts';

const CHUNK_SIZE = 8000;
const OVERLAP = 500;

export interface ProcessedIssue {
  issueNumber: string;
  date: string;
  createdAt: string;
}

export interface ProcessResult {
  issue: ProcessedIssue;
  tenders: ExtractedTender[];
  pageCount: number;
}

function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    chunks.push(text.slice(start, end));
    start += CHUNK_SIZE - OVERLAP;
  }
  return chunks;
}

export async function processPdfBuffer(
  buffer: Buffer,
  issueNumber: string,
  date: string,
): Promise<ProcessResult> {
  let pageCount = 0;

  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    pageCount = pdfDoc.getPageCount();
  } catch (err) {
    logger.warn('[processPdfBuffer] Failed to read page count: %s', err instanceof Error ? err.message : String(err));
  }

  const rawText = Buffer.from(buffer).toString('utf8');
  const chunks = chunkText(rawText);
  const seen = new Set<string>();
  const allTenders: ExtractedTender[] = [];

  for (let i = 0; i < chunks.length; i++) {
    logger.info('[processPdfBuffer] Processing chunk %d of %d', i + 1, chunks.length);
    const tenders = await extractTendersFromText(chunks[i]);
    for (const t of tenders) {
      if (!seen.has(t.tenderNo)) {
        seen.add(t.tenderNo);
        allTenders.push(t);
      }
    }
  }

  return {
    issue: {
      issueNumber,
      date,
      createdAt: new Date().toISOString(),
    },
    tenders: allTenders,
    pageCount,
  };
}
