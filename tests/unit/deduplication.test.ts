import { deduplicateHotels } from '../../src/temporal/activities/hotel.activities';
import { SupplierHotel } from '../../src/types/hotel.types';

function hotel(overrides: Partial<SupplierHotel>): SupplierHotel {
  return {
    hotelId: 'x1',
    name: 'Test Hotel',
    price: 1000,
    city: 'delhi',
    commissionPct: 10,
    supplier: 'Supplier A',
    ...overrides,
  };
}

describe('deduplicateHotels', () => {
  it('keeps the cheaper offer when a hotel exists in both suppliers', async () => {
    const a = [hotel({ hotelId: 'a1', name: 'Holtin', price: 6000, supplier: 'Supplier A' })];
    const b = [hotel({ hotelId: 'b1', name: 'Holtin', price: 5000, supplier: 'Supplier B' })];

    const result = await deduplicateHotels(a, b);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ name: 'Holtin', price: 5000, supplier: 'Supplier B' });
  });

  it('retains a hotel that only exists in Supplier A', async () => {
    const a = [hotel({ hotelId: 'a1', name: 'Radison', price: 5900, supplier: 'Supplier A' })];
    const b: SupplierHotel[] = [];

    const result = await deduplicateHotels(a, b);

    expect(result).toEqual([{ name: 'Radison', price: 5900, supplier: 'Supplier A', commissionPct: 10 }]);
  });

  it('retains a hotel that only exists in Supplier B', async () => {
    const a: SupplierHotel[] = [];
    const b = [hotel({ hotelId: 'b2', name: 'Taj Palace', price: 7200, supplier: 'Supplier B', commissionPct: 15 })];

    const result = await deduplicateHotels(a, b);

    expect(result).toEqual([{ name: 'Taj Palace', price: 7200, supplier: 'Supplier B', commissionPct: 15 }]);
  });

  it('breaks ties deterministically in favor of Supplier A when prices are equal', async () => {
    const a = [hotel({ hotelId: 'a2', name: 'Radison', price: 5900, supplier: 'Supplier A', commissionPct: 13 })];
    const b = [hotel({ hotelId: 'b3', name: 'Radison', price: 5900, supplier: 'Supplier B', commissionPct: 18 })];

    const result = await deduplicateHotels(a, b);

    expect(result).toEqual([{ name: 'Radison', price: 5900, supplier: 'Supplier A', commissionPct: 13 }]);
  });

  it('dedupes case-insensitively and trims whitespace on hotel names', async () => {
    const a = [hotel({ hotelId: 'a1', name: '  Holtin ', price: 6000, supplier: 'Supplier A' })];
    const b = [hotel({ hotelId: 'b1', name: 'holtin', price: 5000, supplier: 'Supplier B' })];

    const result = await deduplicateHotels(a, b);

    expect(result).toHaveLength(1);
    expect(result[0].price).toBe(5000);
  });

  it('sorts the final list ascending by price', async () => {
    const a = [
      hotel({ hotelId: 'a1', name: 'Expensive', price: 9000, supplier: 'Supplier A' }),
      hotel({ hotelId: 'a2', name: 'Cheap', price: 1000, supplier: 'Supplier A' }),
    ];

    const result = await deduplicateHotels(a, []);

    expect(result.map((h) => h.name)).toEqual(['Cheap', 'Expensive']);
  });
});
