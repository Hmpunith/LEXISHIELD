import { Request, Response, NextFunction } from 'express';
import { ThrottleFault } from '../faults/catalog';
import { getConfig } from '../config/env';

interface RateRecord {
  count: number;
  resetTime: number;
}

const clientIpStore = new Map<string, RateRecord>();

// Cleanup stale records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of clientIpStore.entries()) {
    if (now > record.resetTime) {
      clientIpStore.delete(ip);
    }
  }
}, 300000);

export function gatekeeperMiddleware(req: Request, res: Response, next: NextFunction): void {
  const config = getConfig();
  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const ipKey = Array.isArray(clientIp) ? clientIp[0] : String(clientIp);

  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = config.RATE_LIMIT_RPM;

  const current = clientIpStore.get(ipKey);

  if (!current || now > current.resetTime) {
    clientIpStore.set(ipKey, { count: 1, resetTime: now + windowMs });
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
    return next();
  }

  current.count++;
  const remaining = Math.max(0, maxRequests - current.count);
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);

  if (current.count > maxRequests) {
    res.setHeader('Retry-After', Math.ceil((current.resetTime - now) / 1000));
    return next(new ThrottleFault());
  }

  next();
}
