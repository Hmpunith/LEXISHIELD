import { AuditReport } from '../types/legal';

interface DocRecord {
  id: string;
  filename: string;
  rawText: string;
  createdAt: Date;
  auditReport?: AuditReport;
}

class MemoryStore {
  private documents = new Map<string, DocRecord>();

  public saveDocument(id: string, filename: string, rawText: string): DocRecord {
    const doc: DocRecord = {
      id,
      filename,
      rawText,
      createdAt: new Date(),
    };
    this.documents.set(id, doc);
    return doc;
  }

  public getDocument(id: string): DocRecord | null {
    return this.documents.get(id) || null;
  }

  public saveAudit(id: string, report: AuditReport): void {
    const doc = this.documents.get(id);
    if (doc) {
      doc.auditReport = report;
    }
  }

  public getAll(): DocRecord[] {
    return Array.from(this.documents.values());
  }
}

export const documentStore = new MemoryStore();
