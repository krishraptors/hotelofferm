import { randomUUID } from 'crypto';
import { getTemporalClient } from '../temporal/client';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { cityHasCachedOffers, getHotelOffersByPriceRange } from '../redis/hotel.repository';
import { HotelOffer, HotelWorkflowResult, PriceFilter } from '../types/hotel.types';

/**
 * Returns the deduplicated, price-filtered hotel offers for a city.
 *
 * Cache strategy: if Redis already holds a non-expired result for the city
 * (TTL configurable via REDIS_TTL_SECONDS), we skip re-running the Temporal
 * workflow and serve directly from Redis using a range query. Otherwise we
 * run the workflow (suppliers -> dedupe -> save to Redis) and then read the
 * result back from Redis, so the price filter is always applied by Redis.
 */
export async function getHotelOffers(city: string, filter: PriceFilter): Promise<HotelOffer[]> {
  const normalizedCity = city.toLowerCase();

  const cached = await cityHasCachedOffers(normalizedCity);

  if (!cached) {
    await runHotelWorkflow(normalizedCity);
  } else {
    logger.info({ city: normalizedCity }, 'Serving from Redis cache (skipping Temporal workflow)');
  }

  return getHotelOffersByPriceRange(normalizedCity, filter.minPrice, filter.maxPrice);
}

async function runHotelWorkflow(city: string): Promise<HotelWorkflowResult> {
  const client = await getTemporalClient();
  const workflowId = `hotel-offer-${city}-${randomUUID()}`;

  logger.info({ city, workflowId }, 'Incoming hotel request - starting Temporal workflow');

  const result = await client.workflow.execute('hotelOfferWorkflow', {
    taskQueue: env.temporalTaskQueue,
    workflowId,
    args: [{ city }],
  });

  return result as HotelWorkflowResult;
}
