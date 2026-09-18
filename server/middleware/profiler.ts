import { Request, Response, NextFunction } from 'express';

/**
 * Performance Profiler Middleware:
 * Measures backend execution latency in high-resolution microseconds
 * and sets Server-Timing headers for browser devtools & automated efficiency evaluation.
 */
export function profilerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startHr = process.hrtime.bigint();

  res.on('finish', () => {
    const endHr = process.hrtime.bigint();
    const durationMs = Number(endHr - startHr) / 1_000_000;
    
    // Set standard W3C Server-Timing header
    res.setHeader('Server-Timing', `total;dur=${durationMs.toFixed(2)};desc="Total Execution"`);
  });

  next();
}
