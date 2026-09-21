import { NextFunction, Request, Response } from 'express';
import { ApiError } from './error.middleware';
import { PriceFilter } from '../../types/hotel.types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      hotelQuery?: { city: string; filter: PriceFilter };
    }
  }
}

function parsePrice(raw: unknown, paramName: string): number | undefined {
  if (raw === undefined) return undefined;

  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);

  if (typeof value !== 'string' || value.trim() === '' || Number.isNaN(parsed)) {
    throw new ApiError(400, `Query parameter "${paramName}" must be a valid number`, { [paramName]: value });
  }

  if (parsed < 0) {
    throw new ApiError(400, `Query parameter "${paramName}" must not be negative`, { [paramName]: value });
  }

  return parsed;
}

export function validateHotelQuery(req: Request, _res: Response, next: NextFunction): void {
  try {
    const cityRaw = req.query.city;

    if (cityRaw === undefined || Array.isArray(cityRaw) || String(cityRaw).trim() === '') {
      throw new ApiError(400, 'Query parameter "city" is required');
    }

    const city = String(cityRaw).trim().toLowerCase();

    const minPrice = parsePrice(req.query.minPrice, 'minPrice');
    const maxPrice = parsePrice(req.query.maxPrice, 'maxPrice');

    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
      throw new ApiError(400, 'Query parameter "minPrice" must not be greater than "maxPrice"', {
        minPrice,
        maxPrice,
      });
    }

    req.hotelQuery = { city, filter: { minPrice, maxPrice } };
    next();
  } catch (err) {
    next(err);
  }
}
