import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, roles, AuthReq } from '../middleware/auth';
import { Role, ProductType } from '@prisma/client';

const router = Router();

export interface SpaceLeafNode {
  id: string;
  slug: string;
  name: string;
  icon: string;
  domain: 'indoor' | 'outdoor';
  parentId: 'indoor' | 'outdoor';
  description: string;
  craftHighlights: string[];
  matches: (p: any) => boolean;
}

export interface SpaceDomainNode {
  id: 'indoor' | 'outdoor';
  slug: 'indoor' | 'outdoor';
  name: string;
  icon: string;
  domain: 'indoor' | 'outdoor';
  description: string;
  children: SpaceLeafNode[];
}

export const INDOOR_LEAVES: SpaceLeafNode[] = [
  {
    id: 'living-room',
    slug: 'living-room',
    name: 'Living Room',
    icon: '🛋️',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Bespoke wallpapers, Sheesham consoles, rattan chandeliers & artisan mirrors',
    craftHighlights: ['Wall Murals', 'Wood Furniture', 'Artisan Mirrors', 'Chandeliers'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('living') || text.includes('console') || text.includes('mirror') || text.includes('rattan') ||
             text.includes('chandelier') || text.includes('wallpaper') || text.includes('floral') || text.includes('botanical') ||
             text.includes('vase') || text.includes('sculpture') || text.includes('stool') || text.includes('marble');
    }
  },
  {
    id: 'hall',
    slug: 'hall',
    name: 'Hall & Entryway',
    icon: '🚪',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Grand foyer mirrors, entryway consoles, floor urns & luxury statement murals',
    craftHighlights: ['Foyer Mirrors', 'Carved Consoles', 'Brass Urns', 'Statement Urli'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('hall') || text.includes('foyer') || text.includes('entryway') || text.includes('corridor') ||
             text.includes('console') || text.includes('mirror') || text.includes('sculpture') || text.includes('urn') ||
             text.includes('urli') || text.includes('antique brass');
    }
  },
  {
    id: 'bedroom',
    slug: 'bedroom',
    name: 'Bedroom & Suite',
    icon: '🛏️',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Gold leaf botanical murals, bedside lighting, soft textiles & vanity mirrors',
    craftHighlights: ['Suite Murals', 'Bedside Sconces', 'Wood Nightstands', 'Vanity Mirrors'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('bedroom') || text.includes('suite') || text.includes('bedside') || text.includes('mural') ||
             text.includes('wallpaper') || text.includes('botanical') || text.includes('lamp') || text.includes('headboard') ||
             text.includes('nightstand') || text.includes('quilt');
    }
  },
  {
    id: 'kitchen',
    slug: 'kitchen',
    name: 'Kitchen & Pantry',
    icon: '🍳',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Handcrafted ceramic serving dishes, speckled glaze sets & counter stools',
    craftHighlights: ['Ceramic Crockery', 'Tapas Sets', 'Serving Bowls', 'Counter Stools'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('kitchen') || text.includes('pantry') || text.includes('crockery') || text.includes('bowl') ||
             text.includes('tapas') || text.includes('serving') || text.includes('dish') || text.includes('tableware') ||
             text.includes('counter') || text.includes('dipping');
    }
  },
  {
    id: 'dining',
    slug: 'dining',
    name: 'Dining Room',
    icon: '🍽️',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Artisan ceramic bowls, tapas tableware, dining consoles & candelabras',
    craftHighlights: ['Tableware', 'Dining Pendants', 'Candelabras', 'Sheesham Dining'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('dining') || text.includes('dinner') || text.includes('tableware') || text.includes('bowl') ||
             text.includes('tapas') || text.includes('candelabra') || text.includes('table') || text.includes('pendant') ||
             text.includes('serving');
    }
  },
  {
    id: 'study-room',
    slug: 'study-room',
    name: 'Study & Home Office',
    icon: '📚',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Solid Sheesham secretary desks, brass armillary globes & study lamps',
    craftHighlights: ['Writing Desks', 'Brass Showpieces', 'Desk Lamps', 'Study Decor'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('study') || text.includes('office') || text.includes('desk') || text.includes('secretary') ||
             text.includes('armillary') || text.includes('globe') || text.includes('bureau') || text.includes('bookshelf') ||
             text.includes('reading') || text.includes('sheesham');
    }
  },
  {
    id: 'mini-theatre',
    slug: 'mini-theatre',
    name: 'Mini-Theatres & Media Lounge',
    icon: '🎬',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Acoustic velvet wall murals, ambient cinema sconces & low-glare dark decor',
    craftHighlights: ['Acoustic Murals', 'Cinema Lighting', 'Dark Walnut Consoles', 'Ambient Glow'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('theatre') || text.includes('theater') || text.includes('cinema') || text.includes('media') ||
             text.includes('acoustic') || text.includes('sound') || text.includes('screening') || text.includes('sconce');
    }
  },
  {
    id: 'bathroom',
    slug: 'bathroom',
    name: 'Bathrooms & Powder Room',
    icon: '🛁',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Handcrafted ceramic dispensers, anti-fog brass mirrors & vanity suites',
    craftHighlights: ['Ceramic Dispensers', 'Backlit Vanity Mirrors', 'Ribbed Trays', 'Brass Hardware'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('bathroom') || text.includes('bath') || text.includes('powder') || text.includes('vanity') ||
             text.includes('dispenser') || text.includes('tray') || text.includes('capsule') || text.includes('anti-fog') ||
             text.includes('washroom') || text.includes('soap');
    }
  },
  {
    id: 'pooja-room',
    slug: 'pooja-room',
    name: 'Pooja Room & Mandir',
    icon: '🪔',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Hand-hammered brass urlis, temple bells, diya stands & auspicious repousse',
    craftHighlights: ['Brass Urlis', 'Diya Stands', 'Temple Bells', 'Spiritual Decor'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('pooja') || text.includes('puja') || text.includes('mandir') || text.includes('temple') ||
             text.includes('urli') || text.includes('diya') || text.includes('floating') || text.includes('auspicious') ||
             text.includes('windchime') || text.includes('bells');
    }
  },
  {
    id: 'kids-room',
    slug: 'kids-room',
    name: 'Kids Room & Nursery',
    icon: '🧸',
    domain: 'indoor',
    parentId: 'indoor',
    description: 'Whimsical pastel watercolor murals, eco non-woven wall art & nursery accents',
    craftHighlights: ['Eco Murals', 'Whimsical Safari', 'Pastel Decor', 'Playroom Accents'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('kids') || text.includes('nursery') || text.includes('child') || text.includes('safari') ||
             text.includes('whimsical') || text.includes('animal') || text.includes('playroom') || text.includes('pastel');
    }
  }
];

export const OUTDOOR_LEAVES: SpaceLeafNode[] = [
  {
    id: 'parking',
    slug: 'parking',
    name: 'Parking & Porch',
    icon: '🚗',
    domain: 'outdoor',
    parentId: 'outdoor',
    description: 'Heritage cast brass carriage sconces, wrought iron bollards & portico illumination',
    craftHighlights: ['Porch Sconces', 'Iron Bollards', 'Weatherproof Lanterns', 'Driveway Fixtures'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('parking') || text.includes('carport') || text.includes('driveway') || text.includes('porch') ||
             text.includes('bollard') || text.includes('pathway post') || text.includes('garage') || text.includes('carriage');
    }
  },
  {
    id: 'lawn',
    slug: 'lawn',
    name: 'Lawn & Garden',
    icon: '🌳',
    domain: 'outdoor',
    parentId: 'outdoor',
    description: 'Chiseled sandstone garden urn planters, garden sculptures & manicured greens decor',
    craftHighlights: ['Sandstone Planters', 'Stone Urns', 'Garden Statues', 'Landscape Accents'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('lawn') || text.includes('garden') || text.includes('landscaping') || text.includes('planter') ||
             text.includes('urn') || text.includes('sandstone') || text.includes('pedestal') || text.includes('birdbath') ||
             text.includes('plant stand') || text.includes('watering can') || text.includes('trowel');
    }
  },
  {
    id: 'balcony',
    slug: 'balcony',
    name: 'Balcony & Verandah',
    icon: '🪴',
    domain: 'outdoor',
    parentId: 'outdoor',
    description: 'Weatherproof teak & cane stools, temple brass windchimes, hanging bells & planters',
    craftHighlights: ['Cane Stools', 'Brass Windchimes', 'Verandah Seating', 'Hanging Bells'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('balcony') || text.includes('verandah') || text.includes('veranda') || text.includes('cane') ||
             text.includes('windchimes') || text.includes('bells') || text.includes('rattan') || text.includes('planter') ||
             text.includes('watering can') || text.includes('plant stand') || text.includes('pothos') || text.includes('ivy') ||
             text.includes('herb');
    }
  },
  {
    id: 'home-nursery',
    slug: 'home-nursery',
    name: 'Home Nursery & Botanical Living',
    icon: '🌱',
    domain: 'outdoor',
    parentId: 'outdoor',
    description: 'Terracotta seedling planters, live air-purifying greens, botanical murals & artisan garden tools',
    craftHighlights: ['Terracotta Planters', 'Decorative Brass Can', 'Air-Purifying Greens', 'Plant Stands'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('nursery') || text.includes('plant') || text.includes('botanical') || text.includes('gardening') ||
             text.includes('watering can') || text.includes('planter') || text.includes('trowel') || text.includes('pot') ||
             text.includes('herb') || text.includes('ivy') || text.includes('pothos') || text.includes('birdbath') ||
             text.includes('lily') || text.includes('terracotta');
    }
  },
  {
    id: 'patio',
    slug: 'patio',
    name: 'Patio & Courtyard',
    icon: '☀️',
    domain: 'outdoor',
    parentId: 'outdoor',
    description: 'Hammered copper fire bowls, outdoor candelabras, daybed seating & open courtyards',
    craftHighlights: ['Copper Fire Bowls', 'Patio Candelabras', 'Courtyard Tables', 'Brass Lanterns'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('patio') || text.includes('courtyard') || text.includes('fire bowl') || text.includes('fire pit') ||
             (text.includes('outdoor') && text.includes('candelabra')) || (text.includes('outdoor') && text.includes('teak'));
    }
  },
  {
    id: 'terrace',
    slug: 'terrace',
    name: 'Rooftop Terrace',
    icon: '🏙️',
    domain: 'outdoor',
    parentId: 'outdoor',
    description: 'Weatherproof woven rattan pergola lanterns, rooftop lounge accents & sky deck lighting',
    craftHighlights: ['Pergola Lanterns', 'Sky Deck Lighting', 'Terrace Planters', 'Outdoor Rattan'],
    matches: (p: any) => {
      const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
      return text.includes('terrace') || text.includes('rooftop') || text.includes('pergola') || text.includes('sky deck') || text.includes('solar');
    }
  }
];

export const getBotanicalBenefits = (p: any): string[] => {
  const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.material || ''}`.toLowerCase();
  const benefits: string[] = [];
  
  if (text.includes('air-purifying') || text.includes('ivy') || text.includes('pothos') || text.includes('fern') || text.includes('palm') || text.includes('oxygen')) {
    benefits.push('🌬️ Air Purification & Oxygen (Traps VOCs & Formaldehyde)');
  }
  if (text.includes('terracotta') || text.includes('clay') || text.includes('breathable') || text.includes('cooling') || text.includes('birdbath') || text.includes('lily') || text.includes('basin')) {
    benefits.push('💧 Evaporative Cooling & Microclimate Humidity (2-4°C cooler)');
  }
  if (text.includes('biophilic') || text.includes('botanical') || text.includes('green') || text.includes('stand') || text.includes('planter')) {
    benefits.push('🌿 Biophilic Calm (Lowers Cortisol & Visual Stress)');
  }
  if (text.includes('herb') || text.includes('lemongrass') || text.includes('vetiver') || text.includes('copper') || text.includes('aromatic')) {
    benefits.push('🍋 Natural Aromatherapy & Mosquito Repellent');
  }
  if (text.includes('watering can') || text.includes('mister') || text.includes('trowel') || text.includes('gardening') || text.includes('pruner')) {
    benefits.push('✨ Mindful Plant Hydration & Aesthetic Living Decor');
  }

  return benefits;
};

export const ALL_SPACES_LEAVES: SpaceLeafNode[] = [...INDOOR_LEAVES, ...OUTDOOR_LEAVES];

export const matchLeafNode = (leaf: SpaceLeafNode, p: any): boolean => {
  const text = `${p.name} ${p.description || ''} ${p.category?.name || ''} ${p.category?.slug || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
  if (text.includes(leaf.slug.toLowerCase()) || text.includes(leaf.name.toLowerCase())) {
    return true;
  }
  return leaf.matches(p);
};

export const SPACES_DOMAINS: SpaceDomainNode[] = [
  {
    id: 'indoor',
    slug: 'indoor',
    name: 'Indoor Spaces',
    icon: '🏠',
    domain: 'indoor',
    description: 'Living room, hall, bedroom, kitchen, dining, study, mini-theatres, bathrooms, pooja & kids rooms',
    children: INDOOR_LEAVES
  },
  {
    id: 'outdoor',
    slug: 'outdoor',
    name: 'Outdoor Spaces',
    icon: '🌿',
    domain: 'outdoor',
    description: 'Balconies, landscaped lawns, parking porch, patio lounges & rooftop terraces',
    children: OUTDOOR_LEAVES
  }
];

// Retain legacy ROOM_MAPPINGS for backward compatibility
export const ROOM_MAPPINGS = ALL_SPACES_LEAVES;

router.get('/spaces-tree', async (_req, res, next) => {
  try {
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true }
    });

    const matchLeaf = (leaf: SpaceLeafNode, p: any) => matchLeafNode(leaf, p);
    const matchIndoor = (p: any) => INDOOR_LEAVES.some(l => matchLeafNode(l, p));
    const matchOutdoor = (p: any) => OUTDOOR_LEAVES.some(l => matchLeafNode(l, p));

    const treeData = [
      {
        id: 'indoor',
        slug: 'indoor',
        name: 'Indoor Spaces',
        icon: '🏠',
        domain: 'indoor',
        description: 'Living room, hall, bedroom, kitchen, dining, study, mini-theatres, bathrooms, pooja & kids rooms',
        count: allProducts.filter(matchIndoor).length,
        children: INDOOR_LEAVES.map(leaf => ({
          id: leaf.id,
          slug: leaf.slug,
          name: leaf.name,
          icon: leaf.icon,
          domain: leaf.domain,
          parentId: leaf.parentId,
          description: leaf.description,
          craftHighlights: leaf.craftHighlights,
          count: allProducts.filter(p => matchLeaf(leaf, p)).length
        }))
      },
      {
        id: 'outdoor',
        slug: 'outdoor',
        name: 'Outdoor Spaces',
        icon: '🌿',
        domain: 'outdoor',
        description: 'Balconies, landscaped lawns, parking porch, patio lounges & rooftop terraces',
        count: allProducts.filter(matchOutdoor).length,
        children: OUTDOOR_LEAVES.map(leaf => ({
          id: leaf.id,
          slug: leaf.slug,
          name: leaf.name,
          icon: leaf.icon,
          domain: leaf.domain,
          parentId: leaf.parentId,
          description: leaf.description,
          craftHighlights: leaf.craftHighlights,
          count: allProducts.filter(p => matchLeaf(leaf, p)).length
        }))
      }
    ];

    res.json({
      success: true,
      message: 'Spaces tree retrieved successfully',
      data: {
        totalProducts: allProducts.length,
        domains: treeData
      }
    });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12));
    const skip = (page - 1) * limit;

    const q = req.query.q as string;
    const category = req.query.category as string;
    const space = (req.query.space as string) || (req.query.room as string);
    const type = req.query.type as ProductType;
    const includeInactive = req.query.includeInactive === 'true' || req.query.all === 'true';

    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }
    
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }
    if (category) {
      where.category = { slug: category };
    }
    if (type) {
      where.type = type;
    }

    // Fetch products
    let items = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true, inventory: true }
    });

    // Map matching spaces and rooms to each product
    let enrichedItems = items.map(p => {
      const matchingLeaves = ALL_SPACES_LEAVES.filter(leaf => matchLeafNode(leaf, p));
      const isIndoor = INDOOR_LEAVES.some(leaf => matchLeafNode(leaf, p));
      const isOutdoor = OUTDOOR_LEAVES.some(leaf => matchLeafNode(leaf, p));
      const primaryDomain: 'indoor' | 'outdoor' | 'both' = isIndoor && isOutdoor ? 'both' : isIndoor ? 'indoor' : isOutdoor ? 'outdoor' : 'indoor';

      const available = p.inventory
        ? (p.inventory.totalQuantity - p.inventory.reservedQuantity - (p.inventory.damagedQuantity || 0))
        : 0;

      return {
        ...p,
        inventoryAvailable: available,
        inStock: available > 0,
        rooms: matchingLeaves.map(rm => rm.name), // legacy field
        spaces: matchingLeaves.map(leaf => ({
          id: leaf.id,
          slug: leaf.slug,
          name: leaf.name,
          icon: leaf.icon,
          domain: leaf.domain
        })),
        spaceSlugs: [
          ...matchingLeaves.map(l => l.slug),
          isIndoor ? 'indoor' : '',
          isOutdoor ? 'outdoor' : ''
        ].filter(Boolean),
        primaryDomain,
        botanicalBenefits: getBotanicalBenefits(p)
      };
    });

    // Filter by space or domain if specified
    if (space && space !== 'all' && space !== '') {
      if (space === 'indoor') {
        enrichedItems = enrichedItems.filter(p => INDOOR_LEAVES.some(leaf => matchLeafNode(leaf, p)));
      } else if (space === 'outdoor') {
        enrichedItems = enrichedItems.filter(p => OUTDOOR_LEAVES.some(leaf => matchLeafNode(leaf, p)));
      } else {
        const leafDef = ALL_SPACES_LEAVES.find(l => l.slug === space || l.id === space);
        if (leafDef) {
          enrichedItems = enrichedItems.filter(p => matchLeafNode(leafDef, p));
        }
      }
    }

    const total = enrichedItems.length;
    const paginatedItems = enrichedItems.slice(skip, skip + limit);

    res.json({
      success: true,
      message: 'Products retrieved',
      data: {
        items: paginatedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) { next(error); }
});

router.get('/room-categories', async (_req, res, next) => {
  try {
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: { category: true }
    });

    const roomCategories = [
      {
        slug: '',
        name: 'All Spaces',
        icon: '✨',
        description: 'Explore full catalog across indoor and outdoor spaces',
        count: allProducts.length
      },
      ...ALL_SPACES_LEAVES.map(leaf => ({
        slug: leaf.slug,
        name: leaf.name,
        icon: leaf.icon,
        description: leaf.description,
        count: allProducts.filter(p => matchLeafNode(leaf, p)).length
      }))
    ];

    res.json({
      success: true,
      message: 'Room categories retrieved',
      data: roomCategories
    });
  } catch (error) { next(error); }
});

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      }
    });
    res.json({ success: true, message: 'Categories retrieved', data: categories });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: { category: true, inventory: true }
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const matchingLeaves = ALL_SPACES_LEAVES.filter(leaf => matchLeafNode(leaf, product));
    const isIndoor = INDOOR_LEAVES.some(leaf => matchLeafNode(leaf, product));
    const isOutdoor = OUTDOOR_LEAVES.some(leaf => matchLeafNode(leaf, product));
    const primaryDomain: 'indoor' | 'outdoor' | 'both' = isIndoor && isOutdoor ? 'both' : isIndoor ? 'indoor' : isOutdoor ? 'outdoor' : 'indoor';

    const available = product.inventory
      ? (product.inventory.totalQuantity - product.inventory.reservedQuantity - (product.inventory.damagedQuantity || 0))
      : 0;

    const enriched = {
      ...product,
      inventoryAvailable: available,
      inStock: available > 0,
      rooms: matchingLeaves.map(rm => rm.name),
      spaces: matchingLeaves.map(leaf => ({
        id: leaf.id,
        slug: leaf.slug,
        name: leaf.name,
        icon: leaf.icon,
        domain: leaf.domain
      })),
      spaceSlugs: [
        ...matchingLeaves.map(l => l.slug),
        isIndoor ? 'indoor' : '',
        isOutdoor ? 'outdoor' : ''
      ].filter(Boolean),
      primaryDomain,
      botanicalBenefits: getBotanicalBenefits(product)
    };

    res.json({ success: true, message: 'Product retrieved', data: enriched });
  } catch (error) { next(error); }
});

router.post('/', auth, roles(Role.ADMIN, Role.STOCK_MANAGER), async (req: AuthReq, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      slug: z.string().optional(),
      description: z.string(),
      type: z.nativeEnum(ProductType),
      sku: z.string().optional(),
      price: z.number().positive(),
      discountPrice: z.number().positive().optional(),
      categoryId: z.string(),
      unit: z.string().optional(),
      pricePerSqFt: z.number().optional(),
      coverageSqFt: z.number().optional(),
      isCustomizable: z.boolean().optional(),
      material: z.string().optional(),
      finish: z.string().optional(),
      images: z.array(z.string()).optional(),
      initialStock: z.number().int().min(0).optional(),
      reorderLevel: z.number().int().min(0).optional(),
      warehouseLocation: z.string().optional(),
      spaces: z.array(z.string()).optional(),
      primaryDomain: z.enum(['indoor', 'outdoor', 'both']).optional(),
      botanicalBenefits: z.array(z.string()).optional(),
      craftHighlights: z.array(z.string()).optional(),
    });

    const parsed = schema.parse(req.body);
    const { initialStock, reorderLevel, warehouseLocation, spaces, primaryDomain, botanicalBenefits, craftHighlights, ...productData } = parsed;

    const baseSlug = (productData.slug || productData.name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = productData.slug || `${baseSlug}-${Date.now().toString().slice(-4)}`;
    const sku = productData.sku || `IG-${Date.now().toString().slice(-6)}`;

    // Build enriched description incorporating spaces and botanical metadata
    let finalDescription = productData.description.trim();
    const metaTags: string[] = [];
    if (spaces && spaces.length > 0) {
      metaTags.push(`Spaces: ${spaces.join(', ')}`);
    }
    if (primaryDomain) {
      metaTags.push(`Domain: ${primaryDomain}`);
    }
    if (botanicalBenefits && botanicalBenefits.length > 0) {
      metaTags.push(`Botanical Benefits: ${botanicalBenefits.join(' | ')}`);
    }
    if (craftHighlights && craftHighlights.length > 0) {
      metaTags.push(`Craft Highlights: ${craftHighlights.join(', ')}`);
    }
    if (metaTags.length > 0 && !finalDescription.includes('--- Specifications & Living Spaces ---')) {
      finalDescription += `\n\n--- Specifications & Living Spaces ---\n${metaTags.join('\n')}`;
    }

    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
        data: {
          name: productData.name,
          description: finalDescription,
          type: productData.type,
          categoryId: productData.categoryId,
          price: productData.price,
          discountPrice: productData.discountPrice,
          unit: productData.unit || (productData.type === ProductType.CUSTOM_WALLPAPER ? 'sq ft' : 'piece'),
          pricePerSqFt: productData.pricePerSqFt,
          coverageSqFt: productData.coverageSqFt,
          material: productData.material,
          finish: productData.finish,
          slug,
          sku,
          images: productData.images || [],
          isCustomizable: productData.isCustomizable ?? (productData.type === ProductType.CUSTOM_WALLPAPER),
        }
      });

      const inv = await tx.inventory.create({
        data: {
          productId: p.id,
          totalQuantity: initialStock || 0,
          reservedQuantity: 0,
          damagedQuantity: 0,
          reorderLevel: reorderLevel !== undefined ? reorderLevel : 10,
          warehouseLocation: warehouseLocation || 'Main Warehouse',
          unit: p.unit
        }
      });

      if (initialStock && initialStock > 0) {
        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inv.id,
            type: 'STOCK_IN',
            quantity: initialStock,
            previousQuantity: 0,
            newQuantity: initialStock,
            performedBy: req.user!.id,
            referenceId: 'Initial product stock'
          }
        });
      }

      return p;
    });

    res.json({ success: true, message: 'Product created', data: product });
  } catch (error) { next(error); }
});

router.put('/:id', auth, roles(Role.ADMIN, Role.STOCK_MANAGER), async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const schema = z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      description: z.string().optional(),
      type: z.nativeEnum(ProductType).optional(),
      sku: z.string().optional(),
      price: z.number().positive().optional(),
      discountPrice: z.number().positive().nullable().optional(),
      categoryId: z.string().optional(),
      unit: z.string().optional(),
      pricePerSqFt: z.number().optional(),
      coverageSqFt: z.number().optional(),
      isCustomizable: z.boolean().optional(),
      material: z.string().optional(),
      finish: z.string().optional(),
      images: z.array(z.string()).optional(),
      stockQuantity: z.number().int().min(0).optional(),
      reorderLevel: z.number().int().min(0).optional(),
      warehouseLocation: z.string().optional(),
    });

    const parsed = schema.parse(req.body);
    const { stockQuantity, reorderLevel, warehouseLocation, ...productData } = parsed;

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: productData
      });

      if (stockQuantity !== undefined || reorderLevel !== undefined || warehouseLocation !== undefined) {
        const inv = await tx.inventory.findUnique({ where: { productId: id } });
        if (inv) {
          const prevTotal = inv.totalQuantity;
          const newTotal = stockQuantity !== undefined ? stockQuantity : inv.totalQuantity;
          await tx.inventory.update({
            where: { id: inv.id },
            data: {
              ...(stockQuantity !== undefined ? { totalQuantity: newTotal } : {}),
              ...(reorderLevel !== undefined ? { reorderLevel } : {}),
              ...(warehouseLocation !== undefined ? { warehouseLocation } : {}),
            }
          });

          if (stockQuantity !== undefined && stockQuantity !== prevTotal) {
            await tx.inventoryTransaction.create({
              data: {
                inventoryId: inv.id,
                type: stockQuantity > prevTotal ? 'STOCK_IN' : 'ADJUSTMENT',
                quantity: Math.abs(stockQuantity - prevTotal),
                previousQuantity: prevTotal,
                newQuantity: newTotal,
                performedBy: req.user!.id,
                referenceId: 'Stock modified in product edit'
              }
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { category: true, inventory: true }
      });
    });

    res.json({ success: true, message: 'Product updated successfully', data: product });
  } catch (error) { next(error); }
});

router.delete('/:id', auth, roles(Role.ADMIN), async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const force = req.query.force === 'true';

    // Check if referenced in OrderItem
    const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemCount > 0 && !force) {
      // Soft-delete by deactivating to preserve financial audit trail
      const updated = await prisma.product.update({
        where: { id },
        data: { isActive: false }
      });
      return res.json({
        success: true,
        message: 'Product is referenced in existing customer orders. It has been deactivated / archived to preserve financial records.',
        data: { archived: true, product: updated }
      });
    }

    // Delete cart items, inventory, transactions, and product
    await prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({ where: { productId: id } });

      const inv = await tx.inventory.findUnique({ where: { productId: id } });
      if (inv) {
        await tx.inventoryTransaction.deleteMany({ where: { inventoryId: inv.id } });
        await tx.inventory.delete({ where: { id: inv.id } });
      }

      if (orderItemCount > 0 && force) {
        await tx.orderItem.deleteMany({ where: { productId: id } });
      }

      await tx.product.delete({ where: { id } });
    });

    res.json({ success: true, message: 'Product deleted successfully', data: { deleted: true, id } });
  } catch (error) { next(error); }
});

router.patch('/:id/stock', auth, roles(Role.ADMIN, Role.STOCK_MANAGER), async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const schema = z.object({
      action: z.enum(['set', 'add', 'deduct']),
      quantity: z.number().int().min(0),
      reason: z.string().optional()
    });
    const { action, quantity, reason } = schema.parse(req.body);

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({ where: { productId: id } });
      if (!inv) throw new Error('Inventory not found for product');

      let newTotal = inv.totalQuantity;
      let txnType: 'ADJUSTMENT' | 'STOCK_IN' | 'STOCK_OUT' = 'ADJUSTMENT';

      if (action === 'set') {
        newTotal = quantity;
        txnType = 'ADJUSTMENT';
      } else if (action === 'add') {
        newTotal = inv.totalQuantity + quantity;
        txnType = 'STOCK_IN';
      } else if (action === 'deduct') {
        const available = inv.totalQuantity - inv.reservedQuantity - inv.damagedQuantity;
        if (quantity > available) {
          throw new Error(`Cannot deduct ${quantity} units. Only ${available} available unreserved.`);
        }
        newTotal = Math.max(0, inv.totalQuantity - quantity);
        txnType = 'STOCK_OUT';
      }

      await tx.inventory.update({
        where: { id: inv.id },
        data: { totalQuantity: newTotal }
      });

      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inv.id,
          type: txnType,
          quantity: Math.abs(newTotal - inv.totalQuantity) || quantity,
          previousQuantity: inv.totalQuantity,
          newQuantity: newTotal,
          performedBy: req.user!.id,
          referenceId: reason || `Stock ${action} manual operation`
        }
      });

      return tx.product.findUnique({
        where: { id },
        include: { category: true, inventory: true }
      });
    });

    res.json({ success: true, message: `Stock updated (${action}: ${quantity})`, data: updated });
  } catch (error) { next(error); }
});

router.patch('/:id/out-of-stock', auth, roles(Role.ADMIN, Role.STOCK_MANAGER), async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const schema = z.object({
      outOfStock: z.boolean().optional()
    });
    const parsed = schema.parse(req.body);

    const updated = await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({ where: { productId: id } });
      if (!inv) throw new Error('Inventory not found for product');

      const currentAvailable = inv.totalQuantity - inv.reservedQuantity - inv.damagedQuantity;
      const isCurrentlyOutOfStock = currentAvailable <= 0;
      const shouldBeOutOfStock = parsed.outOfStock !== undefined ? parsed.outOfStock : !isCurrentlyOutOfStock;

      let newTotal = inv.totalQuantity;
      if (shouldBeOutOfStock) {
        newTotal = inv.reservedQuantity + inv.damagedQuantity;
      } else {
        newTotal = inv.reservedQuantity + inv.damagedQuantity + Math.max(inv.reorderLevel || 10, 20);
      }

      await tx.inventory.update({
        where: { id: inv.id },
        data: { totalQuantity: newTotal }
      });

      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inv.id,
          type: shouldBeOutOfStock ? 'ADJUSTMENT' : 'STOCK_IN',
          quantity: Math.abs(newTotal - inv.totalQuantity),
          previousQuantity: inv.totalQuantity,
          newQuantity: newTotal,
          performedBy: req.user!.id,
          referenceId: shouldBeOutOfStock ? 'Marked out of stock by manager' : 'Restocked by manager'
        }
      });

      return tx.product.findUnique({
        where: { id },
        include: { category: true, inventory: true }
      });
    });

    res.json({ 
      success: true, 
      message: 'Product stock status updated', 
      data: updated 
    });
  } catch (error) { next(error); }
});

router.patch('/:id/status', auth, roles(Role.ADMIN), async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !product.isActive }
    });

    res.json({ success: true, message: 'Product status updated', data: updated });
  } catch (error) { next(error); }
});

export default router;
