import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { armorMiddleware } from './middleware/armor';
import { gatekeeperMiddleware } from './middleware/gate';
import { purifyInputMiddleware } from './middleware/purify';
import { tracerMiddleware } from './middleware/tracer';
import { profilerMiddleware } from './middleware/profiler';
import { errorHandlerMiddleware } from './middleware/errorHandler';
import { RedisGateway } from './services/redisService';
import auditRoutes from './routes/auditRoutes';
import counselRoutes from './routes/counselRoutes';
import compareRoutes from './routes/compareRoutes';

export function createServerApp() {
  const app = express();

  // High-performance response compression (gzip/deflate)
  app.use(compression({ threshold: 512 }));

  // Basic security and parsing
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Performance telemetry & profiling
  app.use(profilerMiddleware);

  // Custom defensive armor
  app.use(armorMiddleware);
  app.use(tracerMiddleware);
  app.use(gatekeeperMiddleware);
  app.use(purifyInputMiddleware);

  // Enhanced Health check with efficiency telemetry
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'healthy',
      system: 'LexiShield Legal Risk Intelligence Engine',
      version: '1.0.0',
      compression: 'gzip/deflate enabled',
      cacheGateway: RedisGateway.getStatus(),
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/audit', auditRoutes);
  app.use('/api/counsel', counselRoutes);
  app.use('/api/compare', compareRoutes);

  // Global centralized error handler
  app.use(errorHandlerMiddleware);

  return app;
}

const app = createServerApp();
export default app;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.info(`🛡️ [LexiShield Server] Running at http://localhost:${PORT}`);
  });
}
