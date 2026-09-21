import { RawSupplierHotel } from '../types/hotel.types';

/**
 * Static mock catalogue for Supplier A.
 * Overlaps intentionally with Supplier B for "delhi" and "mumbai" to exercise
 * the deduplication/cheapest-offer logic; "bangalore" is A-only for one hotel.
 */
const SUPPLIER_A_DATA: Record<string, RawSupplierHotel[]> = {
  delhi: [
    { hotelId: 'a1', name: 'Holtin', price: 6000, city: 'delhi', commissionPct: 10 },
    { hotelId: 'a2', name: 'Radison', price: 5900, city: 'delhi', commissionPct: 13 },
    { hotelId: 'a3', name: 'The Imperial', price: 8100, city: 'delhi', commissionPct: 12 },
  ],
  mumbai: [
    { hotelId: 'a4', name: 'Taj Mahal Palace', price: 12500, city: 'mumbai', commissionPct: 11 },
    { hotelId: 'a5', name: 'Trident Nariman Point', price: 9800, city: 'mumbai', commissionPct: 14 },
    { hotelId: 'a6', name: 'ITC Maratha', price: 9500, city: 'mumbai', commissionPct: 9 },
  ],
  bangalore: [
    { hotelId: 'a7', name: 'The Leela Palace', price: 11000, city: 'bangalore', commissionPct: 12 },
    { hotelId: 'a8', name: 'ITC Gardenia', price: 8700, city: 'bangalore', commissionPct: 10 },
  ],
};

export function getSupplierAHotels(city: string): RawSupplierHotel[] {
  return SUPPLIER_A_DATA[city.toLowerCase()] ?? [];
}
