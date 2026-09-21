import express, { Express } from 'express';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import { hotelRouter } from './api/routes/hotel.routes';
import { supplierARouter, supplierBRouter } from './api/routes/supplier.routes';
import { healthRouter } from './api/routes/health.routes';
import { errorMiddleware, notFoundHandler } from './api/middleware/error.middleware';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use(
    pinoHttp({
      logger,
      autoLogging: { ignore: (req) => req.url === '/health' },
    }),
  );

  app.use('/api', hotelRouter);
  app.use('/supplierA', supplierARouter);
  app.use('/supplierB', supplierBRouter);
  app.use('/health', healthRouter);

  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}
