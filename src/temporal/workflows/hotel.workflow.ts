import { proxyActivities, log } from '@temporalio/workflow';
import type * as activities from '../activities';
import { HotelWorkflowInput, HotelWorkflowResult, SupplierHotel } from '../../types/hotel.types';

const { getSupplierAHotels, getSupplierBHotels } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 seconds',
  retry: {
    initialInterval: '500 milliseconds',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

const { deduplicateHotels } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: { maximumAttempts: 2 },
});

const { saveHotelsToRedis } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 seconds',
  retry: {
    initialInterval: '500 milliseconds',
    backoffCoefficient: 2,
    maximumAttempts: 3,
  },
});

/**
 * Orchestrates fetching hotel offers from both suppliers in parallel,
 * deduplicating, and persisting the result. Contains no network/Redis calls
 * itself and no non-deterministic operations - all I/O lives in Activities.
 *
 * Resilience: if one supplier activity fails after retries, the workflow
 * does NOT fail the whole request - it proceeds with the healthy supplier's
 * offers and reports which suppliers succeeded.
 */
export async function hotelOfferWorkflow(input: HotelWorkflowInput): Promise<HotelWorkflowResult> {
  const { city } = input;

  log.info('Workflow started', { city });

  const [supplierAResult, supplierBResult] = await Promise.allSettled([
    getSupplierAHotels(city),
    getSupplierBHotels(city),
  ]);

  const supplierAOk = supplierAResult.status === 'fulfilled';
  const supplierBOk = supplierBResult.status === 'fulfilled';

  if (!supplierAOk) {
    log.error('Supplier A failed after retries, continuing with remaining supplier(s)', {
      city,
      reason: (supplierAResult as PromiseRejectedResult).reason?.message,
    });
  }
  if (!supplierBOk) {
    log.error('Supplier B failed after retries, continuing with remaining supplier(s)', {
      city,
      reason: (supplierBResult as PromiseRejectedResult).reason?.message,
    });
  }

  const supplierAHotels: SupplierHotel[] = supplierAOk
    ? (supplierAResult as PromiseFulfilledResult<SupplierHotel[]>).value
    : [];
  const supplierBHotels: SupplierHotel[] = supplierBOk
    ? (supplierBResult as PromiseFulfilledResult<SupplierHotel[]>).value
    : [];

  const offers = await deduplicateHotels(supplierAHotels, supplierBHotels);

  await saveHotelsToRedis(city, offers);

  log.info('Workflow completed', { city, hotelCount: offers.length, supplierAOk, supplierBOk });

  return { city, offers, supplierAOk, supplierBOk };
}
