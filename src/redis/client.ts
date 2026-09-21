import Redis from 'ioredis';
import { env } from '../config/env';
import { logger } from '../config/logger';

export const redisClient = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => Math.min(times * 200, 2000),
  lazyConnect: false,
});

redisClient.on('error', (err) => {
  logger.error({ err: err.message }, 'Redis client error');
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

export async function pingRedis(): Promise<boolean> {
  try {
    const pong = await redisClient.ping();
    return pong === 'PONG';
  } catch (err) {
    logger.error({ err: (err as Error).message }, 'Redis ping failed');
    return false;
  }
}
