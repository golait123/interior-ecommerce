export interface FilterColorOption {
  id: string;
  name: string;
  hex: string;
  keyword: string;
}

export interface FilterSubCategory {
  id: string;
  name: string;
  slug: string;
  keywords: string[];
  colors?: FilterColorOption[];
}

export interface FilterCategoryTree {
  id: string;
  name: string;
  slug: string;
  domain?: 'indoor' | 'outdoor' | 'all';
  subcategories: FilterSubCategory[];
}

export const MASTER_CATEGORY_HIERARCHY: FilterCategoryTree[] = [
  // 1. Seeds & Bulbs (as explicitly requested in prompt example)
  {
    id: 'seeds',
    name: 'Seeds & Bulbs',
    slug: 'seeds',
    domain: 'outdoor',
    subcategories: [
      {
        id: 'vegetable-seeds',
        name: 'Vegetable Seeds',
        slug: 'vegetable-seeds',
        keywords: ['vegetable', 'tomato', 'spinach', 'chilli', 'coriander', 'brinjal', 'cucumber', 'okra']
      },
      {
        id: 'herb-seeds',
        name: 'Herb Seeds',
        slug: 'herb-seeds',
        keywords: ['herb', 'basil', 'mint', 'oregano', 'rosemary', 'thyme', 'lemongrass', 'parsley']
      },
      {
        id: 'all-season-seeds',
        name: 'All Season Seeds',
        slug: 'all-season-seeds',
        keywords: ['all season', 'microgreens', 'salad', 'annual', 'year-round', 'spinach']
      },
      {
        id: 'seeds-by-flower-color',
        name: 'Seeds by Flower Colour',
        slug: 'seeds-by-flower-color',
        keywords: ['flower', 'flowering', 'blossom', 'petal', 'bloom'],
        colors: [
          { id: 'blue', name: 'Blue', hex: '#2563eb', keyword: 'blue' },
          { id: 'yellow', name: 'Yellow', hex: '#eab308', keyword: 'yellow' },
          { id: 'orange', name: 'Orange', hex: '#ea580c', keyword: 'orange' },
          { id: 'red', name: 'Red', hex: '#dc2626', keyword: 'red' },
          { id: 'purple', name: 'Purple', hex: '#9333ea', keyword: 'purple' },
          { id: 'white', name: 'White', hex: '#f8fafc', keyword: 'white' },
          { id: 'pink', name: 'Pink', hex: '#ec4899', keyword: 'pink' }
        ]
      }
    ]
  },

  // 2. Plants & Botanical Living
  {
    id: 'plants',
    name: 'Plants & Foliage',
    slug: 'plants',
    domain: 'outdoor',
    subcategories: [
      {
        id: 'air-purifying',
        name: 'Indoor Air-Purifying Plants',
        slug: 'air-purifying',
        keywords: ['air-purifying', 'snake', 'areca', 'zz', 'peace lily', 'money plant', 'purifying']
      },
      {
        id: 'flowering-plants',
        name: 'Flowering Plants',
        slug: 'flowering-plants',
        keywords: ['flower', 'rose', 'anthurium', 'bougainvillea', 'orchid', 'jasmine', 'hibiscus'],
        colors: [
          { id: 'red', name: 'Red & Crimson', hex: '#dc2626', keyword: 'red' },
          { id: 'pink', name: 'Soft Pink', hex: '#ec4899', keyword: 'pink' },
          { id: 'yellow', name: 'Golden Yellow', hex: '#eab308', keyword: 'yellow' },
          { id: 'white', name: 'Pure White', hex: '#f8fafc', keyword: 'white' }
        ]
      },
      {
        id: 'succulents-cactus',
        name: 'Succulents & Cactus',
        slug: 'succulents-cactus',
        keywords: ['succulent', 'cactus', 'jade', 'aloe', 'haworthia', 'sedum']
      },
      {
        id: 'bonsai-ficus',
        name: 'Bonsai & Lucky Bamboo',
        slug: 'bonsai-ficus',
        keywords: ['bonsai', 'ficus', 'bamboo', 'lucky']
      }
    ]
  },

  // 3. Pots & Planters
  {
    id: 'planters',
    name: 'Pots & Planters',
    slug: 'planters',
    domain: 'all',
    subcategories: [
      {
        id: 'ceramic-planters',
        name: 'Handcrafted Ceramic Pots',
        slug: 'ceramic-planters',
        keywords: ['ceramic', 'glazed', 'stoneware', 'studio pottery']
      },
      {
        id: 'terracotta-pots',
        name: 'Terracotta & Clay Pots',
        slug: 'terracotta-pots',
        keywords: ['terracotta', 'clay', 'earthen', 'un-glazed']
      },
      {
        id: 'self-watering',
        name: 'Self-Watering Planters',
        slug: 'self-watering',
        keywords: ['self-watering', 'sub-irrigation', 'water reservoir']
      },
      {
        id: 'hanging-planters',
        name: 'Hanging & Railing Planters',
        slug: 'hanging-planters',
        keywords: ['hanging', 'railing', 'balcony', 'macrame']
      },
      {
        id: 'metal-brass',
        name: 'Metal & Brass Planters',
        slug: 'metal-brass',
        keywords: ['brass', 'metal', 'copper', 'hammered', 'gold']
      }
    ]
  },

  // 4. Wallpapers & Murals (Interior)
  {
    id: 'custom-wallpapers',
    name: 'Wallpapers & Murals',
    slug: 'custom-wallpapers',
    domain: 'indoor',
    subcategories: [
      {
        id: 'heritage-floral',
        name: 'Indian Heritage & Jaipuri Floral',
        slug: 'heritage-floral',
        keywords: ['heritage', 'floral', 'jaipuri', 'banjara', 'mughal', 'traditional']
      },
      {
        id: 'geometric-abstract',
        name: 'Modern Geometric & Abstract',
        slug: 'geometric-abstract',
        keywords: ['geometric', 'abstract', 'lines', 'minimalist', 'contemporary']
      },
      {
        id: 'textured-canvas',
        name: 'Textured Fabric & Canvas',
        slug: 'textured-canvas',
        keywords: ['textured', 'canvas', 'fabric', 'linen', 'embossed']
      },
      {
        id: 'wood-panels',
        name: '3D Acoustic Wooden Wall Panels',
        slug: 'wood-panels',
        keywords: ['panel', 'wood', 'fluted', 'acoustic', 'slat']
      },
      {
        id: 'wallpapers-by-color',
        name: 'Wallpapers by Color Tone',
        slug: 'wallpapers-by-color',
        keywords: ['color', 'tint', 'palette', 'tone'],
        colors: [
          { id: 'blue', name: 'Navy & Sky Blue', hex: '#0f2444', keyword: 'blue' },
          { id: 'orange', name: 'Warm Terracotta', hex: '#ea580c', keyword: 'orange' },
          { id: 'green', name: 'Forest Green', hex: '#15803d', keyword: 'green' },
          { id: 'white', name: 'White & Cream', hex: '#f8fafc', keyword: 'white' },
          { id: 'black', name: 'Onyx Charcoal', hex: '#0f172a', keyword: 'black' }
        ]
      }
    ]
  },

  // 5. Handcrafted Furniture (Interior)
  {
    id: 'furniture',
    name: 'Handcrafted Wooden Furniture',
    slug: 'furniture',
    domain: 'indoor',
    subcategories: [
      {
        id: 'living-room-furniture',
        name: 'Living Room Furniture',
        slug: 'living-room-furniture',
        keywords: ['sofa', 'coffee table', 'console', 'credenza', 'side table', 'lounge chair']
      },
      {
        id: 'bedroom-furniture',
        name: 'Bedroom Furniture',
        slug: 'bedroom-furniture',
        keywords: ['bed', 'nightstand', 'wardrobe', 'bedside']
      },
      {
        id: 'dining-furniture',
        name: 'Dining & Bar Sets',
        slug: 'dining-furniture',
        keywords: ['dining', 'chair', 'bar stool', 'cabinet', 'sideboard']
      },
      {
        id: 'wood-finishes',
        name: 'By Solid Hardwood Finish',
        slug: 'wood-finishes',
        keywords: ['wood', 'finish', 'hardwood', 'grain'],
        colors: [
          { id: 'teak', name: 'Golden Teak Wood', hex: '#a16207', keyword: 'teak' },
          { id: 'sheesham', name: 'Sheesham Rosewood', hex: '#78350f', keyword: 'sheesham' },
          { id: 'natural-oak', name: 'Natural Cane & Oak', hex: '#d97706', keyword: 'oak' }
        ]
      }
    ]
  },

  // 6. Wall Art & Mirrors (Interior)
  {
    id: 'wall-art',
    name: 'Wall Art & Designer Mirrors',
    slug: 'wall-art',
    domain: 'indoor',
    subcategories: [
      {
        id: 'canvas-paintings',
        name: 'Hand-Painted Canvas Art',
        slug: 'canvas-paintings',
        keywords: ['painting', 'canvas', 'oil', 'madhubani', 'art']
      },
      {
        id: 'carved-jharokhas',
        name: 'Hand-Carved Wooden Jharokhas',
        slug: 'carved-jharokhas',
        keywords: ['jharokha', 'carved', 'wooden panel', 'antique']
      },
      {
        id: 'designer-mirrors',
        name: 'Designer Arch & Sunburst Mirrors',
        slug: 'designer-mirrors',
        keywords: ['mirror', 'arch', 'sunburst', 'brass mirror', 'vanity']
      },
      {
        id: 'metal-sculptures',
        name: 'Metal Wall Art & Reliefs',
        slug: 'metal-sculptures',
        keywords: ['metal', 'brass sculpture', 'relief', 'wall hanging']
      }
    ]
  },

  // 7. Aesthetic Decor & Vases (Interior)
  {
    id: 'aesthetic-decor',
    name: 'Artisan Ceramics & Home Accents',
    slug: 'aesthetic-decor',
    domain: 'indoor',
    subcategories: [
      {
        id: 'ceramic-vases',
        name: 'Studio Ceramic Vases & Urns',
        slug: 'ceramic-vases',
        keywords: ['vase', 'urn', 'ceramic', 'porcelain', 'pottery']
      },
      {
        id: 'brass-diyas',
        name: 'Handcrafted Brass Lamps & Urlis',
        slug: 'brass-diyas',
        keywords: ['brass', 'diya', 'lamp', 'urli', 'lantern', 'candle']
      },
      {
        id: 'marble-stone',
        name: 'Stone Sculptures & Bookends',
        slug: 'marble-stone',
        keywords: ['marble', 'stone', 'bookend', 'sculpture']
      }
    ]
  },

  // 8. Soil & Fertilizer (Outdoor)
  {
    id: 'soil-fertilizer',
    name: 'Soil & Organic Fertilizers',
    slug: 'soil-fertilizer',
    domain: 'outdoor',
    subcategories: [
      {
        id: 'potting-soil',
        name: 'Organic Potting Soil',
        slug: 'potting-soil',
        keywords: ['potting soil', 'organic soil', 'red soil', 'soil mix']
      },
      {
        id: 'bio-fertilizer',
        name: 'Bio-Fertilizer & Plant Food',
        slug: 'bio-fertilizer',
        keywords: ['fertilizer', 'vermicompost', 'seaweed', 'manure', 'compost', 'npk']
      },
      {
        id: 'cocopeat-media',
        name: 'Cocopeat & Aerators',
        slug: 'cocopeat-media',
        keywords: ['cocopeat', 'perlite', 'vermiculite', 'brick']
      }
    ]
  },

  // 9. Outdoor & Exterior Living (Exterior)
  {
    id: 'outdoor',
    name: 'Exterior Living & Patio Decor',
    slug: 'outdoor',
    domain: 'outdoor',
    subcategories: [
      {
        id: 'patio-sets',
        name: 'Weatherproof Patio Furniture',
        slug: 'patio-sets',
        keywords: ['patio', 'weatherproof', 'outdoor sofa', 'rattan', 'wicker', 'bench']
      },
      {
        id: 'exterior-murals',
        name: 'Outdoor Murals & Cladding',
        slug: 'exterior-murals',
        keywords: ['exterior mural', 'weatherproof mural', 'stone cladding', 'brick']
      },
      {
        id: 'balcony-decking',
        name: 'Balcony Deck Tiles & Trellis',
        slug: 'balcony-decking',
        keywords: ['deck', 'tile', 'trellis', 'turf', 'grass', 'bamboo']
      },
      {
        id: 'garden-water-lighting',
        name: 'Garden Fountains & Solar Lights',
        slug: 'garden-water-lighting',
        keywords: ['fountain', 'waterfall', 'solar', 'lantern', 'exterior light']
      }
    ]
  }
];

export function getHierarchyForDomain(domain: 'indoor' | 'outdoor' | 'all'): FilterCategoryTree[] {
  if (domain === 'all') return MASTER_CATEGORY_HIERARCHY;
  return MASTER_CATEGORY_HIERARCHY.filter(cat => cat.domain === 'all' || cat.domain === domain);
}
