/**
 * Redis key helpers.
 *
 * Data model per city:
 *  - `hotel:offers:{city}`      Sorted Set. Member = unique hotel key, score = price.
 *                                Enables O(log N + M) numeric range queries via ZRANGEBYSCORE,
 *                                which is how min/max price filtering is performed *in Redis*.
 *  - `hotel:offer:{city}:{key}` String (JSON). The full HotelOffer object for that member.
 *
 * The sorted set gives us fast range queries; the companion string keys let us
 * recover the full hotel object for the members returned by the range query,
 * without ever loading the whole city's data into JS and filtering client-side.
 */

export function hotelKeyFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function offersSortedSetKey(city: string): string {
  return `hotel:offers:${city.toLowerCase()}`;
}

export function offerDetailKey(city: string, hotelKey: string): string {
  return `hotel:offer:${city.toLowerCase()}:${hotelKey}`;
}
