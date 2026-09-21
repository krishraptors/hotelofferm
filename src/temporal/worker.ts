import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';
import { env } from '../config/env';
import { logger } from '../config/logger';

async function run(): Promise<void> {
  const connection = await NativeConnection.connect({ address: env.temporalAddress });

  const worker = await Worker.create({
    connection,
    namespace: env.temporalNamespace,
    taskQueue: env.temporalTaskQueue,
    workflowsPath: require.resolve('./workflows/hotel.workflow'),
    activities,
  });

  logger.info(
    { taskQueue: env.temporalTaskQueue, namespace: env.temporalNamespace, address: env.temporalAddress },
    'Temporal worker starting',
  );

  await worker.run();
}

run().catch((err) => {
  logger.error({ err: err instanceof Error ? err.message : err }, 'Temporal worker crashed');
  process.exit(1);
});
