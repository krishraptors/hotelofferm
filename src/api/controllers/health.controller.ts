import { Request, Response } from 'express';
import axios from 'axios';
import { pingRedis } from '../../redis/client';
import { isTemporalHealthy } from '../../temporal/client';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

type ServiceStatus = 'healthy' | 'down';

async function checkSupplier(baseUrl: string): Promise<ServiceStatus> {
  try {
    await axios.get(`${baseUrl}/hotels`, { params: { city: '__health_check__' }, timeout: 2000 });
    return 'healthy';
  } catch (err) {
    logger.error({ baseUrl, err: err instanceof Error ? err.message : err }, 'Supplier health check failed');
    return 'down';
  }
}

export async function healthHandler(_req: Request, res: Response): Promise<void> {
  const [redisOk, temporalOk, supplierA, supplierB] = await Promise.all([
    pingRedis(),
    isTemporalHealthy(),
    checkSupplier(env.supplierAUrl),
    checkSupplier(env.supplierBUrl),
  ]);

  const services: Record<string, ServiceStatus> = {
    redis: redisOk ? 'healthy' : 'down',
    temporal: temporalOk ? 'healthy' : 'down',
    supplierA,
    supplierB,
  };

  const allHealthy = Object.values(services).every((status) => status === 'healthy');
  const status = allHealthy ? 'healthy' : 'degraded';

  res.status(allHealthy ? 200 : 503).json({ status, services });
}
