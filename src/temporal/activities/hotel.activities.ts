import { logger } from '../../config/logger';
import { HotelOffer, SupplierHotel } from '../../types/hotel.types';

/**
 * Combines both suppliers' hotel lists, deduplicating by hotel name.
 *
 * Rule: when the same hotel name appears from both suppliers, the cheaper
 * price wins. If prices are exactly equal, Supplier A wins (deterministic
 * tie-break, documented in README).
 */
export async function deduplicateHotels(
  supplierAHotels: SupplierHotel[],
  supplierBHotels: SupplierHotel[],
): Promise<HotelOffer[]> {
  const byName = new Map<string, SupplierHotel>();

  for (const hotel of [...supplierAHotels, ...supplierBHotels]) {
    const key = hotel.name.trim().toLowerCase();
    const existing = byName.get(key);

    if (!existing) {
      byName.set(key, hotel);
      continue;
    }

    if (hotel.price < existing.price) {
      byName.set(key, hotel);
    } else if (hotel.price === existing.price && hotel.supplier === 'Supplier A') {
      // Tie-break: prefer Supplier A when prices are identical.
      byName.set(key, hotel);
    }
    // otherwise keep existing (either strictly cheaper, or a tie already resolved to A)
  }

  const offers: HotelOffer[] = Array.from(byName.values())
    .map(({ name, price, supplier, commissionPct }) => ({ name, price, supplier, commissionPct }))
    .sort((a, b) => a.price - b.price);

  logger.info(
    { supplierACount: supplierAHotels.length, supplierBCount: supplierBHotels.length, hotelCount: offers.length },
    'Deduplication completed',
  );

  return offers;
}
