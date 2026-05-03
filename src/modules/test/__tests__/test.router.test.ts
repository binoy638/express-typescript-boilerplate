import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../../app';

describe('GET /api/test/:id', () => {
  it('returns a greeting for a valid id', async () => {
    const res = await request(app).get('/api/test/world');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Hello world' });
  });
});
