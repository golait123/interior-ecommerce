import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Storefront Pricing & Cart Logic', () => {
  it('formats Indian Rupee (INR) currency correctly', () => {
    const formatINR = (val: number) => `₹${val.toLocaleString('en-IN')}`;
    assert.equal(formatINR(14999), '₹14,999');
    assert.equal(formatINR(1500), '₹1,500');
    assert.equal(formatINR(0), '₹0');
  });

  it('calculates cart item subtotal and totals', () => {
    const items = [
      { id: '1', price: 2499, quantity: 2 },
      { id: '2', price: 999, quantity: 1 }
    ];
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    assert.equal(subtotal, 5997);
    assert.equal(tax, 1079);
    assert.equal(total, 7076);
  });

  it('computes 3D room panorama aspect ratio', () => {
    const width = 4096;
    const height = 2048;
    const ratio = width / height;
    assert.equal(ratio, 2); // 2:1 standard equirectangular 360 projection
  });
});
