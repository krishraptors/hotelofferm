jest.mock('ioredis', () => require('ioredis-mock'));

import { saveHotelOffers, getHotelOffersByPriceRange, cityHasCachedOffers } from '../../src/redis/hotel.repository';
import { HotelOffer } from '../../src/types/hotel.types';

const offers: HotelOffer[] = [
  { name: 'Holtin', price: 5340, supplier: 'Supplier B', commissionPct: 20 },
  { name: 'Radison', price: 5900, supplier: 'Supplier A', commissionPct: 13 },
  { name: 'Taj Palace', price: 7200, supplier: 'Supplier B', commissionPct: 15 },
];

describe('hotel.repository (Redis price-range filtering)', () => {
  beforeEach(async () => {
    await saveHotelOffers('delhi', offers);
  });

  it('marks the city as cached after saving', async () => {
    expect(await cityHasCachedOffers('delhi')).toBe(true);
    expect(await cityHasCachedOffers('nowhere')).toBe(false);
  });

  it('returns all hotels when no filter is applied', async () => {
    const result = await getHotelOffersByPriceRange('delhi');
    expect(result).toHaveLength(3);
  });

  it('filters by minPrice using ZRANGEBYSCORE', async () => {
    const result = await getHotelOffersByPriceRange('delhi', 5900);
    expect(result.map((h) => h.name).sort()).toEqual(['Radison', 'Taj Palace'].sort());
  });

  it('filters by maxPrice using ZRANGEBYSCORE', async () => {
    const result = await getHotelOffersByPriceRange('delhi', undefined, 5900);
    expect(result.map((h) => h.name).sort()).toEqual(['Holtin', 'Radison'].sort());
  });

  it('filters by both minPrice and maxPrice', async () => {
    const result = await getHotelOffersByPriceRange('delhi', 5000, 7000);
    expect(result.map((h) => h.name).sort()).toEqual(['Holtin', 'Radison'].sort());
  });

  it('returns an empty array when nothing matches the range', async () => {
    const result = await getHotelOffersByPriceRange('delhi', 100000);
    expect(result).toEqual([]);
  });

  it('overwrites stale members when re-saved with a different offer set', async () => {
    await saveHotelOffers('delhi', [{ name: 'Only Hotel', price: 1000, supplier: 'Supplier A', commissionPct: 5 }]);
    const result = await getHotelOffersByPriceRange('delhi');
    expect(result).toEqual([{ name: 'Only Hotel', price: 1000, supplier: 'Supplier A', commissionPct: 5 }]);
  });
});
