import { redisClient } from './client';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { HotelOffer } from '../types/hotel.types';
import { hotelKeyFromName, offerDetailKey, offersSortedSetKey } from './redis.keys';

/**
 * Persists the final deduplicated offer list for a city.
 *
 * Uses a Redis Sorted Set (`hotel:offers:{city}`) keyed by price so that
 * price-range queries are served natively by Redis (ZRANGEBYSCORE) instead
 * of loading everything into the app and filtering in JavaScript. The full
 * offer payload lives alongside in a per-hotel string key so the sorted set
 * only ever needs to store the minimal (member, score) pair.
 */
export async function saveHotelOffers(city: string, offers: HotelOffer[]): Promise<void> {
  const zsetKey = offersSortedSetKey(city);

  const existingMembers = await redisClient.zrange(zsetKey, 0, -1);

  const pipeline = redisClient.pipeline();

  if (existingMembers.length > 0) {
    pipeline.del(...existingMembers.map((member) => offerDetailKey(city, member)));
    pipeline.del(zsetKey);
  }

  for (const offer of offers) {
    const hotelKey = hotelKeyFromName(offer.name);
    const detailKey = offerDetailKey(city, hotelKey);
    pipeline.zadd(zsetKey, offer.price, hotelKey);
    pipeline.set(detailKey, JSON.stringify(offer), 'EX', env.redisTtlSeconds);
  }

  if (offers.length > 0) {
    pipeline.expire(zsetKey, env.redisTtlSeconds);
  }

  await pipeline.exec();

  logger.info({ city, hotelCount: offers.length }, 'Redis save completed');
}

/** True if we already have a (non-expired) cached result for this city. */
export async function cityHasCachedOffers(city: string): Promise<boolean> {
  const exists = await redisClient.exists(offersSortedSetKey(city));
  return exists === 1;
}

/**
 * Range query performed entirely in Redis via ZRANGEBYSCORE, then the
 * matching hotel keys are resolved to full objects via MGET. No
 * price filtering happens in application code.
 */
export async function getHotelOffersByPriceRange(
  city: string,
  minPrice?: number,
  maxPrice?: number,
): Promise<HotelOffer[]> {
  const zsetKey = offersSortedSetKey(city);
  const min = minPrice !== undefined ? minPrice : '-inf';
  const max = maxPrice !== undefined ? maxPrice : '+inf';

  const members = await redisClient.zrangebyscore(zsetKey, min, max);

  if (members.length === 0) {
    logger.info({ city, minPrice, maxPrice, hotelCount: 0 }, 'Redis filter executed');
    return [];
  }

  const detailKeys = members.map((member) => offerDetailKey(city, member));
  const raw = await redisClient.mget(...detailKeys);

  const offers = raw
    .filter((value): value is string => value !== null)
    .map((value) => JSON.parse(value) as HotelOffer)
    .sort((a, b) => a.price - b.price);

  logger.info({ city, minPrice, maxPrice, hotelCount: offers.length }, 'Redis filter executed');

  return offers;
}
