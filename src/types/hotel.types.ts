export type SupplierName = 'Supplier A' | 'Supplier B';

/** Raw shape returned by a mock supplier endpoint. */
export interface RawSupplierHotel {
  hotelId: string;
  name: string;
  price: number;
  city: string;
  commissionPct: number;
}

/** Supplier hotel tagged with which supplier produced it. */
export interface SupplierHotel extends RawSupplierHotel {
  supplier: SupplierName;
}

/** Public API shape - the only fields exposed to clients. */
export interface HotelOffer {
  name: string;
  price: number;
  supplier: SupplierName;
  commissionPct: number;
}

export interface SupplierFetchResult {
  supplier: SupplierName;
  hotels: SupplierHotel[];
  succeeded: boolean;
  error?: string;
}

export interface HotelWorkflowInput {
  city: string;
}

export interface HotelWorkflowResult {
  city: string;
  offers: HotelOffer[];
  supplierAOk: boolean;
  supplierBOk: boolean;
}

export interface PriceFilter {
  minPrice?: number;
  maxPrice?: number;
}
