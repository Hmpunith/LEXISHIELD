import { Router, Request, Response, NextFunction } from 'express';
import { compareTwoAgreements } from '../modules/intelligence/comparisonDiff';
import { DocumentParseFault } from '../faults/catalog';

const router = Router();

// POST /api/compare/documents
router.post('/documents', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { docAText, docAName, docBText, docBName } = req.body;

    if (!docAText || !docBText) {
      throw new DocumentParseFault('Both docAText and docBText are required for agreement comparison.');
    }

    const comparison = compareTwoAgreements(
      String(docAText),
      docAName || 'Agreement A',
      String(docBText),
      docBName || 'Agreement B'
    );

    res.json({
      success: true,
      comparison,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
