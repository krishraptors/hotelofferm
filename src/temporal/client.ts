import { Client, Connection } from '@temporalio/client';
import { env } from '../config/env';
import { logger } from '../config/logger';

let cachedClient: Client | undefined;

export async function getTemporalClient(): Promise<Client> {
  if (cachedClient) return cachedClient;

  const connection = await Connection.connect({ address: env.temporalAddress });
  cachedClient = new Client({ connection, namespace: env.temporalNamespace });

  logger.info({ address: env.temporalAddress, namespace: env.temporalNamespace }, 'Temporal client connected');

  return cachedClient;
}

export async function isTemporalHealthy(): Promise<boolean> {
  try {
    const client = await getTemporalClient();
    await client.connection.workflowService.getSystemInfo({});
    return true;
  } catch (err) {
    logger.error({ err: (err as Error).message }, 'Temporal health check failed');
    return false;
  }
}
