import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { extractDocumentText } from '../modules/ingestion/textExtractor';
import { splitDocumentIntoClauses } from '../modules/ingestion/clauseSplitter';
import { auditClausesInBatch } from '../modules/audit/riskAuditor';
import { synthesizeGotchas } from '../modules/intelligence/gotchasSynthesizer';
import { forgeComplianceChecklist } from '../modules/intelligence/checklistForge';
import { buildAttorneyConsultationBrief } from '../modules/intelligence/attorneyBrief';
import { documentStore } from '../storage/connection';
import { MemoVault } from '../services/memoVault';
import { CacheService } from '../services/cacheService';
import { DocumentType, RiskLevel, AuditReport } from '../types/legal';
import { DocumentParseFault } from '../faults/catalog';

const router = Router();
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

function getParamId(req: Request): string {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
}

// POST /api/audit/upload
router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    let rawText = '';
    let filename = 'document.txt';

    if (req.file) {
      filename = req.file.originalname;
      rawText = await extractDocumentText(req.file.buffer, filename);
    } else if (req.body && req.body.text) {
      rawText = String(req.body.text);
      filename = req.body.filename || 'Pasted_Contract.txt';
    } else {
      throw new DocumentParseFault('No document file or text body provided in request.');
    }

    if (rawText.length < 30) {
      throw new DocumentParseFault('Provided document text is too short to parse meaningful legal provisions.');
    }

    const docId = `doc-${crypto.randomUUID()}`;
    const savedDoc = documentStore.saveDocument(docId, filename, rawText);
    CacheService.set(`doc:${docId}`, savedDoc, 3600);

    res.status(201).json({
      success: true,
      documentId: docId,
      filename,
      characterCount: rawText.length,
      wordCount: rawText.split(/\s+/).length,
      message: 'Document successfully ingested. Ready for automated audit.',
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/audit/:id/analyze
router.post('/:id/analyze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = getParamId(req);
    let doc = documentStore.getDocument(docId);
    if (!doc) {
      doc = CacheService.get<any>(`doc:${docId}`);
    }
    if (!doc) {
      const fallbackText = req.body?.rawText || req.body?.text;
      if (fallbackText && typeof fallbackText === 'string') {
        doc = documentStore.saveDocument(docId, req.body.filename || 'contract.txt', fallbackText);
      }
    }

    if (!doc) {
      throw new DocumentParseFault(`Document ID '${docId}' not found or session expired.`);
    }

    // Check memoization vault
    const cacheKey = `audit:${MemoVault.hashContent(doc.rawText)}`;
    const cachedReport = MemoVault.get<AuditReport>(cacheKey);
    if (cachedReport) {
      documentStore.saveAudit(docId, cachedReport);
      return res.json({ success: true, report: cachedReport, cached: true });
    }

    const docType = (req.body?.documentType as DocumentType) || DocumentType.FreelanceContract;
    const parsedClauses = splitDocumentIntoClauses(doc.rawText);

    // High-efficiency two-stage vector audit: Stage 1 Vector Cosine + Stage 2 Batched LLM
    const auditedClauses = await auditClausesInBatch(parsedClauses, docType);

    const gotchas = synthesizeGotchas(auditedClauses);
    const checklist = forgeComplianceChecklist(auditedClauses);
    const attorneyBrief = buildAttorneyConsultationBrief(auditedClauses, docType, doc.filename);

    const riskDist = {
      standard: auditedClauses.filter((c) => c.riskLevel === RiskLevel.Standard).length,
      caution: auditedClauses.filter((c) => c.riskLevel === RiskLevel.Caution).length,
      unfavorable: auditedClauses.filter((c) => c.riskLevel === RiskLevel.Unfavorable).length,
      critical: auditedClauses.filter((c) => c.riskLevel === RiskLevel.Critical).length,
    };

    const avgRisk = auditedClauses.length > 0
      ? auditedClauses.reduce((acc, c) => acc + c.riskScore, 0) / auditedClauses.length
      : 20;

    const overallScore = Math.max(10, Math.min(98, Math.round(100 - avgRisk)));

    const report: AuditReport = {
      documentId: docId,
      filename: doc.filename,
      documentType: docType,
      timestamp: new Date().toISOString(),
      clauseCount: auditedClauses.length,
      wordCount: doc.rawText.split(/\s+/).length,
      overallScore,
      riskDistribution: riskDist,
      gotchas,
      clauses: auditedClauses,
      checklist,
      attorneyBrief,
      legalDisclaimer: 'Informational analysis only. Not legal advice or attorney representation.',
    };

    documentStore.saveAudit(docId, report);
    MemoVault.set(cacheKey, report);
    CacheService.set(cacheKey, report, 86400);

    res.json({
      success: true,
      report,
      cached: false,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/audit/:id/report
router.get('/:id/report', (req: Request, res: Response, next: NextFunction) => {
  try {
    const docId = getParamId(req);
    const doc = documentStore.getDocument(docId);
    if (!doc || !doc.auditReport) {
      throw new DocumentParseFault(`Audit report for ID '${docId}' not found. Please trigger analysis first.`);
    }
    res.json({ success: true, report: doc.auditReport });
  } catch (err) {
    next(err);
  }
});

export default router;
