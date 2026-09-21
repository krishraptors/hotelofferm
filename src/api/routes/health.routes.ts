import { Router } from 'express';
import { healthHandler } from '../controllers/health.controller';

export const healthRouter = Router();
healthRouter.get('/', healthHandler);
