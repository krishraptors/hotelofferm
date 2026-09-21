import axios from 'axios';
import { env } from '../../config/env';
import { logger } from '../../config/logger';
import { RawSupplierHotel, SupplierHotel } from '../../types/hotel.types';

const httpClient = axios.create({ timeout: env.supplierHttpTimeoutMs });

async function fetchSupplierHotels(
  baseUrl: string,
  supplier: SupplierHotel['supplier'],
  city: string,
): Promise<SupplierHotel[]> {
  const start = Date.now();
  logger.info({ supplier, city }, `${supplier} request started`);

  try {
    const response = await httpClient.get<RawSupplierHotel[]>(`${baseUrl}/hotels`, {
      params: { city },
    });

    const hotels: SupplierHotel[] = response.data.map((hotel) => ({ ...hotel, supplier }));

    logger.info(
      { supplier, city, hotelCount: hotels.length, durationMs: Date.now() - start },
      `${supplier} response received`,
    );

    return hotels;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error({ supplier, city, durationMs: Date.now() - start, err: message }, 'Supplier failure');
    throw new Error(`${supplier} request failed: ${message}`);
  }
}

export async function getSupplierAHotels(city: string): Promise<SupplierHotel[]> {
  return fetchSupplierHotels(env.supplierAUrl, 'Supplier A', city);
}

export async function getSupplierBHotels(city: string): Promise<SupplierHotel[]> {
  return fetchSupplierHotels(env.supplierBUrl, 'Supplier B', city);
}
