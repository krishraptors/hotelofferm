import { Router } from 'express';
import { getHotelsHandler } from '../controllers/hotel.controller';
import { validateHotelQuery } from '../middleware/validation.middleware';

export const hotelRouter = Router();
hotelRouter.get('/hotels', validateHotelQuery, getHotelsHandler);
