import { describe, it, expect } from 'vitest';
import { extractDocumentText } from '../../server/modules/ingestion/textExtractor';

describe('Text Extractor Unit Tests', () => {
  it('should extract text cleanly from UTF-8 buffers', async () => {
    const raw = 'MUTUAL AGREEMENT\n1. Purpose\nThis is a valid contract.';
    const buffer = Buffer.from(raw, 'utf8');
    const text = await extractDocumentText(buffer, 'contract.txt');
    expect(text).toBe(raw);
  });

  it('should handle markdown contract files', async () => {
    const raw = '# Software Agreement\n\n## Terms\nPayment due in 30 days.';
    const buffer = Buffer.from(raw, 'utf8');
    const text = await extractDocumentText(buffer, 'terms.md');
    expect(text).toContain('Software Agreement');
  });

  it('should trim surrounding whitespace', async () => {
    const buffer = Buffer.from('   Contract text with spaces   ', 'utf8');
    const text = await extractDocumentText(buffer, 'doc.txt');
    expect(text).toBe('Contract text with spaces');
  });
});
