import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Supplier mock endpoints', () => {
  it('GET /supplierA/hotels?city=delhi returns Supplier A hotels', async () => {
    const res = await request(app).get('/supplierA/hotels').query({ city: 'delhi' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('hotelId');
  });

  it('GET /supplierB/hotels?city=delhi returns Supplier B hotels', async () => {
    const res = await request(app).get('/supplierB/hotels').query({ city: 'delhi' });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('returns an empty array for a city with no data', async () => {
    const res = await request(app).get('/supplierA/hotels').query({ city: 'atlantis' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/hotels validation', () => {
  it('returns 400 when city is missing', async () => {
    const res = await request(app).get('/api/hotels');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Bad Request');
  });

  it('returns 400 when minPrice is not numeric', async () => {
    const res = await request(app).get('/api/hotels').query({ city: 'delhi', minPrice: 'abc' });
    expect(res.status).toBe(400);
  });

  it('returns 400 when minPrice > maxPrice', async () => {
    const res = await request(app).get('/api/hotels').query({ city: 'delhi', minPrice: 7000, maxPrice: 5000 });
    expect(res.status).toBe(400);
  });
});

describe('Unknown routes', () => {
  it('returns 404 for an undefined route', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.status).toBe(404);
  });
});

describe('Simulated supplier outage', () => {
  afterEach(async () => {
    await request(app).post('/supplierA/toggle-down').send({ down: false });
  });

  it('returns 503 from the supplier endpoint once toggled down', async () => {
    const toggle = await request(app).post('/supplierA/toggle-down').send({ down: true });
    expect(toggle.status).toBe(200);
    expect(toggle.body).toEqual({ supplier: 'Supplier A', down: true });

    const res = await request(app).get('/supplierA/hotels').query({ city: 'delhi' });
    expect(res.status).toBe(503);
  });

  it('recovers once toggled back up', async () => {
    await request(app).post('/supplierA/toggle-down').send({ down: true });
    await request(app).post('/supplierA/toggle-down').send({ down: false });

    const res = await request(app).get('/supplierA/hotels').query({ city: 'delhi' });
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
