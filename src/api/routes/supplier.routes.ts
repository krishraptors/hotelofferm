import { Router } from 'express';
import {
  supplierAHandler,
  supplierBHandler,
  toggleSupplierAHandler,
  toggleSupplierBHandler,
} from '../controllers/supplier.controller';

export const supplierARouter = Router();
supplierARouter.get('/hotels', supplierAHandler);
supplierARouter.post('/toggle-down', toggleSupplierAHandler);

export const supplierBRouter = Router();
supplierBRouter.get('/hotels', supplierBHandler);
supplierBRouter.post('/toggle-down', toggleSupplierBHandler);
