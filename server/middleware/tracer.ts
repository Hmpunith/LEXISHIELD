import { Request, Response, NextFunction } from 'express';

/**
 * Truncates string safely to prevent sensitive legal document leakage into server logs.
 */
export function truncateLogString(str: string, maxLength: number = 160): string {
  if (!str) {return '';}
  return str.length > maxLength ? `${str.slice(0, maxLength)}... [${str.length - maxLength} chars truncated]` : str;
}

export function tracerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const reqId = (req as any).requestId || 'req-init';

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.info(
      `[${new Date().toISOString()}] [${reqId}] ${req.method} ${req.originalUrl || req.url} ` +
      `Status=${res.statusCode} Duration=${duration}ms IP=${req.ip || 'local'}`
    );
  });

  next();
}
