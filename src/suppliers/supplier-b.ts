import { RawSupplierHotel } from '../types/hotel.types';

/**
 * Static mock catalogue for Supplier B.
 * Contains hotels overlapping with Supplier A at different (usually cheaper)
 * prices, plus hotels unique to Supplier B.
 */
const SUPPLIER_B_DATA: Record<string, RawSupplierHotel[]> = {
  delhi: [
    { hotelId: 'b1', name: 'Holtin', price: 5340, city: 'delhi', commissionPct: 20 },
    { hotelId: 'b2', name: 'Taj Palace', price: 7200, city: 'delhi', commissionPct: 15 },
    { hotelId: 'b3', name: 'Radison', price: 5900, city: 'delhi', commissionPct: 18 },
  ],
  mumbai: [
    { hotelId: 'b4', name: 'Taj Mahal Palace', price: 11800, city: 'mumbai', commissionPct: 16 },
    { hotelId: 'b5', name: 'The Oberoi', price: 13200, city: 'mumbai', commissionPct: 17 },
  ],
  bangalore: [
    { hotelId: 'b6', name: 'The Leela Palace', price: 10600, city: 'bangalore', commissionPct: 19 },
    { hotelId: 'b7', name: 'Sheraton Grand', price: 9100, city: 'bangalore', commissionPct: 13 },
  ],
};

export function getSupplierBHotels(city: string): RawSupplierHotel[] {
  return SUPPLIER_B_DATA[city.toLowerCase()] ?? [];
}
