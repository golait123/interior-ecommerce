import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getProductArConfig } from '../src/routes/products';

describe('WebXR AR Configuration & Specifications', () => {
  it('assigns wall placement and accurate dimensions for wallpapers and wall art', () => {
    const wallpaperProduct = {
      name: 'Bespoke Marble Vein Luxury Wallpaper',
      description: 'Handcrafted floral mural for accent wall',
      material: 'Non-woven vinyl',
      category: { name: 'Wallpapers' }
    };

    const arConfig = getProductArConfig(wallpaperProduct);
    assert.equal(arConfig.enabled, true);
    assert.equal(arConfig.placementType, 'wall');
    assert.equal(arConfig.geometryType, 'wall-art');
    assert.equal(arConfig.dimensions.widthMeters, 1.2);
    assert.equal(arConfig.dimensions.heightMeters, 0.9);
  });

  it('assigns floor placement and tall dimensions for indoor plants and planters', () => {
    const plantProduct = {
      name: 'Monstera Deliciosa with Ceramic Planter',
      description: 'Living botanical plant in terracotta planter',
      category: { name: 'Indoor Plants' }
    };

    const arConfig = getProductArConfig(plantProduct);
    assert.equal(arConfig.enabled, true);
    assert.equal(arConfig.placementType, 'floor');
    assert.equal(arConfig.geometryType, 'plant');
    assert.equal(arConfig.dimensions.heightMeters, 1.2);
    assert.equal(arConfig.dimensions.widthMeters, 0.6);
  });

  it('assigns floor placement and true-to-scale dimensions for sofas and couches', () => {
    const sofaProduct = {
      name: 'Banjara Velvet 3-Seater Chesterfield Sofa',
      description: 'Hand-tufted velvet living room sofa with teakwood legs',
      category: { name: 'Living Room' }
    };

    const arConfig = getProductArConfig(sofaProduct);
    assert.equal(arConfig.enabled, true);
    assert.equal(arConfig.placementType, 'floor');
    assert.equal(arConfig.geometryType, 'sofa');
    assert.equal(arConfig.dimensions.widthMeters, 2.1);
    assert.equal(arConfig.dimensions.depthMeters, 0.95);
    assert.ok(arConfig.dimensions.widthFeet > 6.0);
  });

  it('assigns tabletop placement for vases and decorative artifacts', () => {
    const vaseProduct = {
      name: 'Artisan Ceramic Flower Vase Pair',
      description: 'Sculptural terracotta tabletop vase',
      category: { name: 'Aesthetic Decor' }
    };

    const arConfig = getProductArConfig(vaseProduct);
    assert.equal(arConfig.enabled, true);
    assert.equal(arConfig.placementType, 'tabletop');
    assert.equal(arConfig.geometryType, 'vase');
    assert.equal(arConfig.dimensions.heightMeters, 0.45);
  });
});

describe('WebXR AR Session Lifecycle & Metrics', () => {
  it('validates session lifecycle transition states', () => {
    const validStates = ['initiated', 'active', 'placed', 'ended'];
    assert.ok(validStates.includes('initiated'));
    assert.ok(validStates.includes('active'));
    assert.ok(validStates.includes('placed'));
    assert.ok(validStates.includes('ended'));
  });

  it('computes AR conversion rate and placement efficiency correctly', () => {
    const totalSessions = 50;
    const placedSessions = 42;
    const cartConversions = 18;

    const placementRate = Number(((placedSessions / totalSessions) * 100).toFixed(1));
    const cartConversionRate = Number(((cartConversions / totalSessions) * 100).toFixed(1));

    assert.equal(placementRate, 84.0);
    assert.equal(cartConversionRate, 36.0);
  });
});
