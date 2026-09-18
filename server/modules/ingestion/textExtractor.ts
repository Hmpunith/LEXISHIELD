import pdfParse from 'pdf-parse';
import { DocumentParseFault } from '../../faults/catalog';

export async function extractDocumentText(buffer: Buffer, originalName: string): Promise<string> {
  const ext = originalName.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf') {
    try {
      const data = await pdfParse(buffer);
      return data.text.trim();
    } catch (err) {
      throw new DocumentParseFault(`Failed to extract text from PDF file '${originalName}': ${(err as Error).message}`);
    }
  }

  // Fallback to UTF-8 text interpretation for TXT, MD, DOC, etc.
  try {
    return buffer.toString('utf8').trim();
  } catch (err) {
    throw new DocumentParseFault(`Failed to decode text file '${originalName}': ${(err as Error).message}`);
  }
}
