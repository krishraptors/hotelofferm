import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const parsed = Number(raw);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${name} must be numeric, got "${raw}"`);
  }
  return parsed;
}

export const env = {
  port: optionalNumber('PORT', 3000),
  logLevel: required('LOG_LEVEL', 'info'),

  redisHost: required('REDIS_HOST', 'localhost'),
  redisPort: optionalNumber('REDIS_PORT', 6379),
  redisTtlSeconds: optionalNumber('REDIS_TTL_SECONDS', 3600),

  temporalAddress: required('TEMPORAL_ADDRESS', 'localhost:7233'),
  temporalNamespace: required('TEMPORAL_NAMESPACE', 'default'),
  temporalTaskQueue: required('TEMPORAL_TASK_QUEUE', 'hotel-offer-task-queue'),

  supplierAUrl: required('SUPPLIER_A_URL', 'http://localhost:3000/supplierA'),
  supplierBUrl: required('SUPPLIER_B_URL', 'http://localhost:3000/supplierB'),
  supplierHttpTimeoutMs: optionalNumber('SUPPLIER_HTTP_TIMEOUT_MS', 5000),
} as const;
