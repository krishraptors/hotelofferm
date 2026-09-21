import { Request, Response } from 'express';
import { validateHotelQuery } from '../../src/api/middleware/validation.middleware';
import { ApiError } from '../../src/api/middleware/error.middleware';

function mockReq(query: Record<string, unknown>): Request {
  return { query } as unknown as Request;
}

describe('validateHotelQuery', () => {
  it('rejects a missing city with 400', () => {
    const next = jest.fn();
    validateHotelQuery(mockReq({}), {} as Response, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    const err = next.mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(400);
  });

  it('accepts a valid city with no price filters', () => {
    const req = mockReq({ city: 'delhi' });
    const next = jest.fn();
    validateHotelQuery(req, {} as Response, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.hotelQuery).toEqual({ city: 'delhi', filter: { minPrice: undefined, maxPrice: undefined } });
  });

  it('rejects a non-numeric minPrice', () => {
    const next = jest.fn();
    validateHotelQuery(mockReq({ city: 'delhi', minPrice: 'abc' }), {} as Response, next);

    const err = next.mock.calls[0][0] as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(400);
  });

  it('rejects a negative price', () => {
    const next = jest.fn();
    validateHotelQuery(mockReq({ city: 'delhi', minPrice: '-100' }), {} as Response, next);

    const err = next.mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(400);
  });

  it('rejects minPrice greater than maxPrice', () => {
    const next = jest.fn();
    validateHotelQuery(mockReq({ city: 'delhi', minPrice: '7000', maxPrice: '5000' }), {} as Response, next);

    const err = next.mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(400);
  });

  it('accepts minPrice only', () => {
    const req = mockReq({ city: 'delhi', minPrice: '5000' });
    const next = jest.fn();
    validateHotelQuery(req, {} as Response, next);

    expect(req.hotelQuery?.filter).toEqual({ minPrice: 5000, maxPrice: undefined });
  });

  it('accepts maxPrice only', () => {
    const req = mockReq({ city: 'delhi', maxPrice: '7000' });
    const next = jest.fn();
    validateHotelQuery(req, {} as Response, next);

    expect(req.hotelQuery?.filter).toEqual({ minPrice: undefined, maxPrice: 7000 });
  });

  it('accepts both minPrice and maxPrice', () => {
    const req = mockReq({ city: 'delhi', minPrice: '5000', maxPrice: '7000' });
    const next = jest.fn();
    validateHotelQuery(req, {} as Response, next);

    expect(req.hotelQuery?.filter).toEqual({ minPrice: 5000, maxPrice: 7000 });
  });
});
