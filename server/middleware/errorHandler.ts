import { Request, Response, NextFunction } from 'express';
import { LexiShieldFault } from '../faults/catalog';
import { truncateLogString } from './tracer';

export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const reqId = (req as any).requestId || 'no-req-id';
  const isOperational = (err as LexiShieldFault).isOperational || false;
  const statusCode = (err as LexiShieldFault).statusCode || 500;
  const errorCode = (err as LexiShieldFault).code || 'INTERNAL_ERROR';

  console.error(`[ERROR] [${reqId}] Code=${errorCode} Status=${statusCode} Msg=${truncateLogString(err.message)}`);

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred while processing the legal document.',
      requestId: reqId,
      timestamp: new Date().toISOString(),
      ...(isOperational ? { details: (err as LexiShieldFault).details } : {}),
    },
    disclaimer: 'LexiShield provides automated informational assistance and does not constitute legal representation or advice.',
  });
}
