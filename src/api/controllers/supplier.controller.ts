import { Request, Response } from 'express';
import { getSupplierAHotels } from '../../suppliers/supplier-a';
import { getSupplierBHotels } from '../../suppliers/supplier-b';
import { isSupplierDown, setSupplierDown } from '../../suppliers/supplier-state';
import { logger } from '../../config/logger';

export function supplierAHandler(req: Request, res: Response): void {
  if (isSupplierDown('Supplier A')) {
    res.status(503).json({ error: 'Service Unavailable', message: 'Supplier A is currently down (simulated)' });
    return;
  }
  const city = String(req.query.city ?? '').toLowerCase();
  res.json(getSupplierAHotels(city));
}

export function supplierBHandler(req: Request, res: Response): void {
  if (isSupplierDown('Supplier B')) {
    res.status(503).json({ error: 'Service Unavailable', message: 'Supplier B is currently down (simulated)' });
    return;
  }
  const city = String(req.query.city ?? '').toLowerCase();
  res.json(getSupplierBHotels(city));
}

/**
 * Testing/demo helper: toggles a simulated outage for Supplier A or B so
 * resilience (partial results, /health degradation) can be exercised without
 * running each supplier as a separate service. Not part of the public
 * hotel-search contract.
 */
export function toggleSupplierAHandler(req: Request, res: Response): void {
  const down = Boolean(req.body?.down);
  setSupplierDown('Supplier A', down);
  logger.info({ supplier: 'Supplier A', down }, 'Supplier outage simulation toggled');
  res.status(200).json({ supplier: 'Supplier A', down });
}

export function toggleSupplierBHandler(req: Request, res: Response): void {
  const down = Boolean(req.body?.down);
  setSupplierDown('Supplier B', down);
  logger.info({ supplier: 'Supplier B', down }, 'Supplier outage simulation toggled');
  res.status(200).json({ supplier: 'Supplier B', down });
}
