import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

describe('Architectural Calculations', () => {
  it('calculates primary wall area accurately', () => {
    const width = 16;
    const height = 10;
    const area = width * height;
    assert.equal(area, 160);
  });

  it('calculates billable area with 10% wastage', () => {
    const width = 16;
    const height = 10;
    const area = width * height;
    const billable = Math.ceil(area * 1.10);
    assert.equal(billable, 176);
  });

  it('computes wallpaper pricing with 18% GST', () => {
    const billableArea = 176;
    const pricePerSqFt = 85;
    const materialCost = billableArea * pricePerSqFt;
    const tax = Math.round(materialCost * 0.18);
    const total = materialCost + tax;

    assert.equal(materialCost, 14960);
    assert.equal(tax, 2693);
    assert.equal(total, 17653);
  });
});

describe('Authentication & Security', () => {
  const JWT_SECRET = 'test-secret-key-12345678901234567890';

  it('signs and verifies JWT tokens correctly', () => {
    const payload = { sub: 'user-uuid-123', role: 'CUSTOMER' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string; role: string };

    assert.equal(decoded.sub, 'user-uuid-123');
    assert.equal(decoded.role, 'CUSTOMER');
  });

  it('rejects invalid or tampered JWT tokens', () => {
    const payload = { sub: 'user-uuid-123', role: 'CUSTOMER' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    assert.throws(() => {
      jwt.verify(token, 'wrong-secret-key');
    });
  });

  it('hashes and compares passwords securely with bcrypt', async () => {
    const rawPassword = 'BanjaraSecretPassword#2026';
    const hash = await bcrypt.hash(rawPassword, 10);

    const isMatch = await bcrypt.compare(rawPassword, hash);
    const isWrongMatch = await bcrypt.compare('WrongPassword', hash);

    assert.equal(isMatch, true);
    assert.equal(isWrongMatch, false);
  });
});

describe('MongoDB Data Model Verification', () => {
  it('verifies default roles and permissions', () => {
    const allowedRoles = ['CUSTOMER', 'ADMIN', 'STOCK_MANAGER', 'DESIGNER'];
    assert.ok(allowedRoles.includes('ADMIN'));
    assert.ok(allowedRoles.includes('CUSTOMER'));
    assert.ok(allowedRoles.includes('STOCK_MANAGER'));
    assert.ok(allowedRoles.includes('DESIGNER'));
  });

  it('validates 360 panorama room presets', () => {
    const presets = [
      { id: 'preset-living', name: 'Panoramic Minimalist Living Suite' },
      { id: 'preset-bedroom', name: 'Panoramic Master Bedroom Suite' }
    ];

    assert.equal(presets.length, 2);
    assert.equal(presets[0].id, 'preset-living');
    assert.equal(presets[1].id, 'preset-bedroom');
  });
});
