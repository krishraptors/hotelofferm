import { NextFunction, Request, Response } from 'express';
import { getHotelOffers } from '../../services/hotel.service';

export async function getHotelsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { city, filter } = req.hotelQuery!;
    const offers = await getHotelOffers(city, filter);
    res.status(200).json(offers);
  } catch (err) {
    next(err);
  }
}
