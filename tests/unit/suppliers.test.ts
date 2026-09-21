import { getSupplierAHotels } from '../../src/suppliers/supplier-a';
import { getSupplierBHotels } from '../../src/suppliers/supplier-b';

describe('mock supplier data', () => {
  it('returns hotels for delhi from both suppliers with overlapping names', () => {
    const a = getSupplierAHotels('delhi');
    const b = getSupplierBHotels('delhi');

    expect(a.length).toBeGreaterThan(0);
    expect(b.length).toBeGreaterThan(0);

    const aNames = new Set(a.map((h) => h.name));
    const bNames = new Set(b.map((h) => h.name));
    const overlap = [...aNames].filter((name) => bNames.has(name));

    expect(overlap.length).toBeGreaterThan(0);
  });

  it('returns an empty array for an unknown city', () => {
    expect(getSupplierAHotels('atlantis')).toEqual([]);
    expect(getSupplierBHotels('atlantis')).toEqual([]);
  });

  it('is case-insensitive on city lookup', () => {
    expect(getSupplierAHotels('DELHI').length).toBe(getSupplierAHotels('delhi').length);
  });

  it('has data for delhi, mumbai and bangalore', () => {
    for (const city of ['delhi', 'mumbai', 'bangalore']) {
      expect(getSupplierAHotels(city).length + getSupplierBHotels(city).length).toBeGreaterThan(0);
    }
  });
});
