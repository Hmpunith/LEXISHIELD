import { Router, Request, Response, NextFunction } from 'express';
import { documentStore } from '../storage/connection';
import { answerLegalQuestion } from '../modules/intelligence/counselChat';
import { DocumentParseFault } from '../faults/catalog';

const router = Router();

// POST /api/counsel/chat
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId, question, history } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question string is required.' });
    }

    const doc = documentStore.getDocument(documentId);
    if (!doc || !doc.auditReport) {
      throw new DocumentParseFault(`Document ID '${documentId}' with completed audit not found.`);
    }

    const result = await answerLegalQuestion(question, doc.auditReport.clauses, history || []);

    res.json({
      success: true,
      answer: result.answer,
      citations: result.citations,
      disclaimer: 'Answers are generated for general understanding and do not replace legal counsel.',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
