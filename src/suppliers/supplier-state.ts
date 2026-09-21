import { SupplierName } from '../types/hotel.types';

/**
 * In-memory toggle used to simulate a supplier outage for demo/testing
 * purposes (e.g. the Postman "supplier down" scenario), without needing to
 * run each supplier as a separate container. Reset on process restart.
 */
const downState: Record<SupplierName, boolean> = {
  'Supplier A': false,
  'Supplier B': false,
};

export function setSupplierDown(supplier: SupplierName, down: boolean): void {
  downState[supplier] = down;
}

export function isSupplierDown(supplier: SupplierName): boolean {
  return downState[supplier];
}
