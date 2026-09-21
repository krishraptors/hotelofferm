import { logger } from '../../config/logger';
import { saveHotelOffers } from '../../redis/hotel.repository';
import { HotelOffer } from '../../types/hotel.types';

export async function saveHotelsToRedis(city: string, offers: HotelOffer[]): Promise<void> {
  try {
    await saveHotelOffers(city, offers);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ city, err: message }, 'Redis failure');
    throw new Error(`Failed to save hotel offers to Redis: ${message}`);
  }
}
