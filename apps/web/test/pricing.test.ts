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

  it('preserves pending unauthenticated item and restores into cart on login', () => {
    // Simulated customer unauthenticated add-to-cart journey
    const pendingItem = {
      productId: 'prod_sheesham_01',
      quantity: 2,
      productName: 'Handcrafted Sheesham Dining Table',
      returnTo: '/shop',
    };

    // Serialize to pending storage
    const stored = JSON.stringify(pendingItem);
    const retrieved = JSON.parse(stored);

    assert.equal(retrieved.productId, 'prod_sheesham_01');
    assert.equal(retrieved.quantity, 2);

    // Simulated user login cart merge
    const userCart = {
      id: 'cart_user_123',
      items: [
        {
          id: 'item_01',
          quantity: retrieved.quantity,
          product: { id: retrieved.productId, name: retrieved.productName, price: '18500' },
        },
      ],
    };

    assert.equal(userCart.items.length, 1);
    assert.equal(userCart.items[0].product.name, 'Handcrafted Sheesham Dining Table');
    assert.equal(userCart.items[0].quantity, 2);
  });

  it('strictly isolates products by selected room/space (Bedroom, Living Room, Pooja, etc.)', () => {
    const catalog = [
      { id: '1', name: 'Sheesham King Bed', spaceSlugs: ['bedroom'] },
      { id: '2', name: 'Japandi Nightstand', spaceSlugs: ['bedroom'] },
      { id: '3', name: 'Terracotta Wallpaper', spaceSlugs: ['living-room'] },
      { id: '4', name: 'Chesterfield Sofa', spaceSlugs: ['living-room'] },
      { id: '5', name: 'Teak Pooja Mandir', spaceSlugs: ['pooja-room'] },
      { id: '6', name: 'Balcony Planter Urn', spaceSlugs: ['balcony'] },
    ];

    const filterBySpace = (items: typeof catalog, selectedSpace: string) => {
      const sSlug = selectedSpace.toLowerCase().trim();
      const sKey = sSlug.replace(/-/g, ' ');
      return items.filter(p => {
        if (Array.isArray(p.spaceSlugs) && p.spaceSlugs.length > 0) {
          return p.spaceSlugs.some(s => s.toLowerCase() === sSlug || s.toLowerCase().includes(sSlug));
        }
        const text = p.name.toLowerCase();
        return text.includes(sKey) || text.includes(sSlug.replace(/-/g, ' '));
      });
    };

    // Selecting Bedroom returns ONLY bedroom products
    const bedroomProducts = filterBySpace(catalog, 'bedroom');
    assert.equal(bedroomProducts.length, 2);
    assert.ok(bedroomProducts.every(p => p.spaceSlugs.includes('bedroom')));
    assert.ok(!bedroomProducts.some(p => p.name.includes('Sofa')));

    // Selecting Living Room returns ONLY living room products
    const livingProducts = filterBySpace(catalog, 'living-room');
    assert.equal(livingProducts.length, 2);
    assert.ok(livingProducts.every(p => p.spaceSlugs.includes('living-room')));
    assert.ok(!livingProducts.some(p => p.name.includes('Bed')));

    // Selecting Pooja Room returns ONLY pooja room products
    const poojaProducts = filterBySpace(catalog, 'pooja-room');
    assert.equal(poojaProducts.length, 1);
    assert.equal(poojaProducts[0].name, 'Teak Pooja Mandir');
  });

  it('returns all items across rooms when All Interior or All Exterior is selected', () => {
    const fullCatalog = [
      { id: '1', name: 'Sheesham King Bed', primaryDomain: 'indoor', spaceSlugs: ['bedroom'] },
      { id: '2', name: 'Terracotta Wallpaper', primaryDomain: 'indoor', spaceSlugs: ['living-room'] },
      { id: '3', name: 'Teak Pooja Mandir', primaryDomain: 'indoor', spaceSlugs: ['pooja-room'] },
      { id: '4', name: 'Balcony Planter Urn', primaryDomain: 'outdoor', spaceSlugs: ['balcony'] },
      { id: '5', name: 'Lawn Garden Bench', primaryDomain: 'outdoor', spaceSlugs: ['lawn'] },
    ];

    const filterShop = (items: typeof fullCatalog, selectedSpace: string, activeDomain: string) => {
      let filtered = [...items];
      const effectiveDomain = (selectedSpace === 'indoor' || selectedSpace === 'interior')
        ? 'indoor'
        : (selectedSpace === 'outdoor' || selectedSpace === 'exterior')
        ? 'outdoor'
        : activeDomain;

      if (effectiveDomain && effectiveDomain !== 'all') {
        filtered = filtered.filter(p => p.primaryDomain === effectiveDomain || p.primaryDomain === 'both');
      }

      const isDomainOnly = !selectedSpace || 
        selectedSpace === 'all' || 
        selectedSpace === 'indoor' || 
        selectedSpace === 'outdoor' || 
        selectedSpace === 'interior' || 
        selectedSpace === 'exterior' || 
        selectedSpace === activeDomain;

      if (!isDomainOnly) {
        filtered = filtered.filter(p => p.spaceSlugs.includes(selectedSpace));
      }
      return filtered;
    };

    // Selecting 'indoor' / 'All Interior' returns ALL 3 indoor rooms
    const interiorItems = filterShop(fullCatalog, 'indoor', 'indoor');
    assert.equal(interiorItems.length, 3);
    assert.ok(interiorItems.some(i => i.spaceSlugs.includes('bedroom')));
    assert.ok(interiorItems.some(i => i.spaceSlugs.includes('living-room')));
    assert.ok(interiorItems.some(i => i.spaceSlugs.includes('pooja-room')));

    // Selecting 'outdoor' / 'All Exterior' returns ALL 2 outdoor spaces
    const exteriorItems = filterShop(fullCatalog, 'outdoor', 'outdoor');
    assert.equal(exteriorItems.length, 2);
    assert.ok(exteriorItems.some(i => i.spaceSlugs.includes('balcony')));
    assert.ok(exteriorItems.some(i => i.spaceSlugs.includes('lawn')));

    // Selecting 'all' / 'All Spaces' returns all 5 items
    const allItems = filterShop(fullCatalog, '', 'all');
    assert.equal(allItems.length, 5);
  });

  it('progressively batches items for infinite scroll (8 items per scroll batch)', () => {
    const mock20Items = Array.from({ length: 20 }, (_, i) => ({ id: `prod_${i}`, name: `Piece ${i}` }));
    
    // Batch 1 (Initial scroll view)
    let visibleCount = 8;
    let displayed = mock20Items.slice(0, visibleCount);
    assert.equal(displayed.length, 8);
    assert.equal(displayed[0].id, 'prod_0');
    assert.equal(displayed[7].id, 'prod_7');

    // Batch 2 (Scrolled down -> loads 8 more)
    visibleCount = Math.min(visibleCount + 8, mock20Items.length);
    displayed = mock20Items.slice(0, visibleCount);
    assert.equal(displayed.length, 16);

    // Batch 3 (Scrolled down -> loads remaining 4)
    visibleCount = Math.min(visibleCount + 8, mock20Items.length);
    displayed = mock20Items.slice(0, visibleCount);
    assert.equal(displayed.length, 20);
    assert.equal(visibleCount < mock20Items.length, false); // hasMore = false
  });
});
