// Curated Indian Folk Art, Heritage Masterclasses & Artisan Metadata
// Inspired by MeMeraki (India's premier culture-tech platform)

export interface FolkArtwork {
  id: string;
  name: string;
  artForm: 'Pichwai' | 'Madhubani' | 'Gond' | 'Warli' | 'Tanjore' | 'Pattachitra' | 'Phad' | 'Miniature' | 'Kerala Mural';
  artisanName: string;
  artisanTitle: string;
  artisanRegion: string;
  state: string;
  price: number;
  discountPrice: number | null;
  dimensions: string; // e.g. "24 × 36 inches"
  widthInches: number;
  heightInches: number;
  aspectRatio: number; // width / height
  material: string; // e.g. "Natural Stone Pigments on Handwoven Cotton"
  medium: string;
  framingOptions: string[];
  description: string;
  heritageStory: string;
  giTagged: boolean;
  images: string[];
  badge?: string;
  inStock: boolean;
  featured: boolean;
}

export interface MasterclassItem {
  id: string;
  title: string;
  artForm: string;
  instructorName: string;
  instructorTitle: string;
  instructorImage: string;
  region: string;
  level: 'Beginner Friendly' | 'Intermediate' | 'Master Level';
  startDate: string;
  duration: string;
  sessionsCount: number;
  priceWithKit: number;
  priceDigitalOnly: number;
  kitIncluded: string[];
  syllabus: { week: string; topic: string; details: string }[];
  thumbnail: string;
  seatsLeft: number;
  rating: number;
  reviewsCount: number;
}

export interface ArtFormCategory {
  id: string;
  slug: string;
  name: string;
  originState: string;
  region: string;
  icon: string;
  heroImage: string;
  description: string;
  technique: string;
  history: string;
  keyMotifs: string[];
}

export const ART_FORM_CATEGORIES: ArtFormCategory[] = [
  {
    id: 'pichwai',
    slug: 'pichwai',
    name: 'Pichwai Paintings',
    originState: 'Rajasthan',
    region: 'Nathdwara, Udaipur',
    icon: '🪷',
    heroImage: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80',
    description: '400-year-old devotional cloth paintings celebrating Shrinathji, sacred Kamdhenu cows, and blooming lotus ponds.',
    technique: 'Natural stone pigments, crushed real gold & silver leaf applied on starched handwoven cotton with fine squirrel-hair brushes.',
    history: 'Originated in the 17th century at the temple shrine of Nathdwara near Udaipur, traditionally hung behind the deity as sacred backdrops.',
    keyMotifs: ['Kamdhenu Cows', 'Lotus Blooms', 'Kadamba Tree', 'Dancing Peacocks', 'Shrinathji Swaroop']
  },
  {
    id: 'madhubani',
    slug: 'madhubani',
    name: 'Madhubani / Mithila Art',
    originState: 'Bihar',
    region: 'Mithila & Jitwarpur',
    icon: '🌳',
    heroImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    description: 'Intricate geometric folklore painting characterized by double line borders, hatching, and nature-centric symbolism.',
    technique: 'Twigs, nib pens, matchsticks and fingers using natural dyes derived from turmeric, indigo, kusum flowers, and soot.',
    history: 'GI-tagged ancient heritage tracing back to the Ramayana era, traditionally painted on freshly plastered mud walls during weddings and festivals.',
    keyMotifs: ['Tree of Life', 'Sun God Surya', 'Kohbar Shrine', 'Sacred Fish (Matsya)', 'Peacock Pair']
  },
  {
    id: 'gond',
    slug: 'gond',
    name: 'Gond Tribal Art',
    originState: 'Madhya Pradesh',
    region: 'Dindori & Patangarh',
    icon: '🦌',
    heroImage: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
    description: 'Dynamic tribal art celebrating the spirit of nature through rhythmic dots, dashes, and vibrant forest animal narratives.',
    technique: 'Pattani fine ink line work layered with custom dotting patterns using organic plant saps, charcoal, and red clay.',
    history: 'Practiced by the Gond tribe of Central India, believing that viewing a sacred artwork brings good fortune and invokes forest protective deities.',
    keyMotifs: ['Mahua Tree of Life', 'Spotted Deer', 'Horned Stags', 'Birds in Flight', 'Serpent Gods']
  },
  {
    id: 'warli',
    slug: 'warli',
    name: 'Warli Tribal Painting',
    originState: 'Maharashtra',
    region: 'Dahanu & Palghar',
    icon: '⭕',
    heroImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80',
    description: 'Monochromatic geometric harmony capturing the rhythm of human life, community tarpa dance, and agricultural cycles.',
    technique: 'White rice paste and water gum painted onto red ochre (Geru) cow-dung plaster with chewed bamboo sticks.',
    history: 'Traces back to 2500 BCE cave traditions, focusing on community harmony and mother nature rather than deities.',
    keyMotifs: ['Tarpa Spiral Dance', 'Harvest Celebration', 'Mother Earth (Palaghata)', 'Village Dwellings', 'Flora & Fauna']
  },
  {
    id: 'tanjore',
    slug: 'tanjore',
    name: 'Tanjore 24K Gold Paintings',
    originState: 'Tamil Nadu',
    region: 'Thanjavur',
    icon: '👑',
    heroImage: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80',
    description: 'Opulent South Indian classical painting renowned for gilded 24K gold foil relief (Gesso work) and semi-precious Jaipur gemstones.',
    technique: 'Chalk powder and Arabic gum relief gesso, overlaid with pure 24-karat gold foil leaves and semi-precious stones on seasoned jackfruit wood.',
    history: 'Patronized by the Chola and Maratha rulers of Thanjavur in the 16th century to adorn palace chambers and private shrines.',
    keyMotifs: ['Lord Balaji', 'Gajalakshmi', 'Baby Krishna (Butter Thief)', 'Radha Krishna', 'Durga']
  },
  {
    id: 'pattachitra',
    slug: 'pattachitra',
    name: 'Pattachitra Scroll Art',
    originState: 'Odisha',
    region: 'Raghurajpur Heritage Village',
    icon: '📜',
    heroImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    description: 'Exquisite cloth-based scroll paintings with razor-fine outlines, mythological epics, and floral vine borders.',
    technique: 'Cotton cloth treated with tamarind seed paste and chalk, polished with sea conch shell stones, painted with mineral pigments.',
    history: 'Closely linked to the 12th-century worship of Lord Jagannath in Puri, created by hereditary Chitrakar artisan families.',
    keyMotifs: ['Jagannath Triad', 'Gita Govinda', 'Radha Krishna Rasleela', 'Dashavatara', 'Tree of Life']
  }
];

export const CURATED_FOLK_ARTWORKS: FolkArtwork[] = [
  {
    id: 'pichwai-kamdhenu-lotus',
    name: 'Sacred Kamdhenu & Blooming Lotus Pichwai',
    artForm: 'Pichwai',
    artisanName: 'Master Artisan Rameshwar Sharma',
    artisanTitle: '4th Generation Pichwai Master Artist',
    artisanRegion: 'Nathdwara, Udaipur',
    state: 'Rajasthan',
    price: 34500,
    discountPrice: 28900,
    dimensions: '30 × 40 inches (76 × 102 cm)',
    widthInches: 30,
    heightInches: 40,
    aspectRatio: 0.75,
    material: 'Natural Stone Pigments & 24K Real Gold Dust on Handwoven Cotton',
    medium: 'Handmade Natural Pigments',
    framingOptions: ['Antique Carved Gold Leaf', 'Natural Indian Teakwood', 'Matte Obsidian Gallery Wood', 'Museum Canvas Wrap'],
    description: 'An ethereal Pichwai masterpiece depicting the celestial Kamdhenu cow standing amidst sacred lotuses in full bloom beneath the twilight sky of Nathdwara. Painted meticulously over 9 weeks using ground lapis lazuli, malachite, and powdered gold ink.',
    heritageStory: 'Pichwai painting was born in the 17th century as a ceremonial temple backdrop for the shrine of Shrinathji. Every lotus bud represents an offering of deep devotion (Bhakti), while the golden jewelry on Kamdhenu honors the abundance of mother earth.',
    giTagged: true,
    images: [
      'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85'
    ],
    badge: 'National Heritage Masterpiece',
    inStock: true,
    featured: true
  },
  {
    id: 'madhubani-tree-of-life',
    name: 'Mithila Tree of Life & Forest Symphony',
    artForm: 'Madhubani',
    artisanName: 'Sita Devi & Artisan Collective',
    artisanTitle: 'National Awardee & State Guild Master',
    artisanRegion: 'Jitwarpur, Madhubani',
    state: 'Bihar',
    price: 24500,
    discountPrice: 19800,
    dimensions: '24 × 36 inches (61 × 91 cm)',
    widthInches: 24,
    heightInches: 36,
    aspectRatio: 0.67,
    material: 'Natural Organic Dyes on Handmade Moonj Bamboo Paper',
    medium: 'Bamboo Nib & Natural Dyes',
    framingOptions: ['Natural Indian Teakwood', 'Matte Obsidian Gallery Wood', 'Antique Carved Gold Leaf'],
    description: 'Celebrated Kachni style Madhubani painting depicting the sacred Kalpavriksha (Tree of Life). Perched on its branches are peacocks, parrots, and dancing cranes, while joyful turtles and fish swim at the roots symbolizing prosperity and cosmic balance.',
    heritageStory: 'Madhubani art is passed down through generations of women in Mithila. The fine monochromatic and dual-tone hatching (Kachni) demands weeks of relentless precision using handmade bamboo quills.',
    giTagged: true,
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=85'
    ],
    badge: 'GI Tagged Heritage',
    inStock: true,
    featured: true
  },
  {
    id: 'gond-mahua-birds',
    name: 'Sacred Mahua Tree & Flight of Hornbills',
    artForm: 'Gond',
    artisanName: 'Master Bhajju Shyam Guild',
    artisanTitle: 'Padma Shri Lineage Master Artist',
    artisanRegion: 'Patangarh, Dindori',
    state: 'Madhya Pradesh',
    price: 26000,
    discountPrice: 21500,
    dimensions: '30 × 30 inches (76 × 76 cm)',
    widthInches: 30,
    heightInches: 30,
    aspectRatio: 1,
    material: 'Archival Ink & Natural Earth Pigments on Canvas',
    medium: 'Fine Line Dotting Technique',
    framingOptions: ['Matte Obsidian Gallery Wood', 'Natural Indian Teakwood', 'Museum Canvas Wrap'],
    description: 'An iconic Gond tribal artwork capturing the Mahua tree, whose sacred nectar feeds the hornbills and forest fauna. Every leaf and petal is woven with hypnotic, rhythmic dot patterns that breathe living movement into the canvas.',
    heritageStory: 'For the Gond tribe of Central India, art is a prayer for good fortune. Every master artist develops their own signature micro-pattern (dots, dashes, seed husks, or fish scales) that is uniquely identifiable like a fingerprint.',
    giTagged: true,
    images: [
      'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85'
    ],
    badge: 'Padma Shri Lineage',
    inStock: true,
    featured: true
  },
  {
    id: 'tanjore-gajalakshmi-gold',
    name: 'Gajalakshmi Tanjore Painting with 24K Gold Foil',
    artForm: 'Tanjore',
    artisanName: 'Master S. Kumar & Sons',
    artisanTitle: 'Hereditary Temple Guild Craftsman',
    artisanRegion: 'Thanjavur',
    state: 'Tamil Nadu',
    price: 48000,
    discountPrice: 39500,
    dimensions: '20 × 26 inches (51 × 66 cm)',
    widthInches: 20,
    heightInches: 26,
    aspectRatio: 0.77,
    material: '24K Pure Gold Foil, Jaipur Gemstones & Teakwood Board',
    medium: 'Classical Gesso Relief & Gold Foil',
    framingOptions: ['Antique Carved Gold Leaf', 'Ornate Chettinad Teakwood'],
    description: 'Magnificent South Indian temple artwork of Goddess Gajalakshmi seated on a pink lotus, flanked by two celestial white elephants pouring holy water from golden vessels. Sculpted in deep three-dimensional limestone gesso relief and wrapped in certified 24-karat gold foil.',
    heritageStory: 'Tanjore paintings have adorned royal halls and sanctuaries since the Maratha golden age. The rich gold foil reflects ambient oil lamps, creating a radiant divine presence that retains its luster for over a century.',
    giTagged: true,
    images: [
      'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=85'
    ],
    badge: 'Certified 24K Gold Foil',
    inStock: true,
    featured: true
  },
  {
    id: 'warli-tarpa-harmony',
    name: 'Tarpa Dance & Cosmic Village Circle',
    artForm: 'Warli',
    artisanName: 'Jivya Soma Mashe Guild',
    artisanTitle: 'National Awardee Tribal Guild',
    artisanRegion: 'Dahanu, Palghar',
    state: 'Maharashtra',
    price: 18500,
    discountPrice: 14900,
    dimensions: '24 × 24 inches (61 × 61 cm)',
    widthInches: 24,
    heightInches: 24,
    aspectRatio: 1,
    material: 'Rice Flour Paste & Organic Gum on Geru Earth Plastered Canvas',
    medium: 'Tribal Rice Flour & Bamboo Stick',
    framingOptions: ['Natural Indian Teakwood', 'Matte Obsidian Gallery Wood', 'Museum Canvas Wrap'],
    description: 'The definitive Warli composition: hundreds of villagers joining hands in a spiral circle dancing around the Tarpa player. The spiral dance mimics the cosmic cycle of seasons, harvest, and life renewal.',
    heritageStory: 'Unlike court paintings, Warli art celebrates the ordinary rhythm of tribal daily life without kings or deities. The triangle symbolizes the human torso and mountains, while circles represent the sun and moon.',
    giTagged: true,
    images: [
      'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85'
    ],
    badge: 'Tribal GI Heritage',
    inStock: true,
    featured: true
  },
  {
    id: 'pattachitra-krishna-leela',
    name: 'Radha Krishna Rasleela on Tussar Silk',
    artForm: 'Pattachitra',
    artisanName: 'Master Apanna Mahapatra',
    artisanTitle: 'State Awardee Chitrakar',
    artisanRegion: 'Raghurajpur Heritage Village',
    state: 'Odisha',
    price: 29500,
    discountPrice: 24000,
    dimensions: '24 × 36 inches (61 × 91 cm)',
    widthInches: 24,
    heightInches: 36,
    aspectRatio: 0.67,
    material: 'Mineral Colors & Conch Shell White on Raw Tussar Silk',
    medium: 'Natural Mineral Pigments on Silk',
    framingOptions: ['Natural Indian Teakwood', 'Antique Carved Gold Leaf', 'Matte Obsidian Gallery Wood'],
    description: 'An intricate Pattachitra masterpiece created on raw golden Tussar silk. Features the central Rasleela surrounded by 8 circular medallions depicting the ten avatars of Vishnu, framed by an ornate triple floral vine border.',
    heritageStory: 'Every year during the Debasnana Purnima at Puri Jagannath Temple, Pattachitra scrolls are installed while the deities rest. Artisans in the heritage crafts village of Raghurajpur handcraft every brush from mouse hair and shell pigments.',
    giTagged: true,
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1200&q=85'
    ],
    badge: 'Tussar Silk Scroll',
    inStock: true,
    featured: true
  }
];

export const MASTERCLASSES_DATA: MasterclassItem[] = [
  {
    id: 'pichwai-intensive-masterclass',
    title: 'Pichwai Painting Intensive: The Lotus & Kamdhenu',
    artForm: 'Pichwai',
    instructorName: 'Master Artisan Rameshwar Sharma',
    instructorTitle: '4th Generation Pichwai Master from Nathdwara',
    instructorImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    region: 'Nathdwara, Rajasthan',
    level: 'Beginner Friendly',
    startDate: 'Sat, Oct 12, 2026',
    duration: '4 Weeks • 8 Live Zoom Sessions',
    sessionsCount: 8,
    priceWithKit: 3499,
    priceDigitalOnly: 1799,
    kitIncluded: [
      'Handmade Starched Wasli Cotton Board (16x20")',
      'Natural Stone Pigments (Lapis, Malachite, Geru, Lampblack)',
      'Real Gold Leaf & Gilded Foil Sheets',
      'Fine 000 & 0 Squirrel-hair Style Fine Liners',
      'Arabic Gum Binder & Mixing Oyster Shells'
    ],
    syllabus: [
      { week: 'Week 1', topic: 'History & Sacred Geometry', details: 'Introduction to Nathdwara Pichwai heritage, preparation of Wasli base, and geometric grid proportions.' },
      { week: 'Week 2', topic: 'The Sacred Lotus Pond', details: 'Techniques of shading petals (Gadhai), water waves, and multi-layer natural mineral pigment washes.' },
      { week: 'Week 3', topic: 'The Celestial Kamdhenu', details: 'Anatomy and iconography of the sacred cow, bell collars, and delicate facial detailing.' },
      { week: 'Week 4', topic: 'Gold Leaf Embellishment & Final Framing', details: 'Applying natural gum binder, laying gold leaf foil, burnishing with agate stone, and preservation.' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=800&q=80',
    seatsLeft: 6,
    rating: 4.95,
    reviewsCount: 142
  },
  {
    id: 'madhubani-tree-of-life-workshop',
    title: 'Mithila Folk Art: The Sacred Tree of Life (Kachni Style)',
    artForm: 'Madhubani',
    instructorName: 'National Awardee Sita Devi',
    instructorTitle: 'State Heritage Master Artist',
    instructorImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    region: 'Jitwarpur, Bihar',
    level: 'Beginner Friendly',
    startDate: 'Sun, Oct 20, 2026',
    duration: '2 Weeks • 4 Live Sessions',
    sessionsCount: 4,
    priceWithKit: 2499,
    priceDigitalOnly: 1299,
    kitIncluded: [
      'Handmade Moonj Grass Botanical Paper (12x16")',
      'Handmade Nib Pens & Bamboo Quills',
      'Natural Organic Pigment Inks (Indigo, Turmeric, Madder)',
      'Reference Mithila Motif Workbook'
    ],
    syllabus: [
      { week: 'Session 1', topic: 'Double Lines & Mithila Borders', details: 'Mastering the signature double line (Gohana) and corner geometric border grids.' },
      { week: 'Session 2', topic: 'The Kalpavriksha Trunk & Foliage', details: 'Intricate Kachni line hatching and fish-scale branch textures.' },
      { week: 'Session 3', topic: 'Avian & Aquatic Symbolism', details: 'Drawing mating peacocks, parrots, turtles, and auspicious fish.' },
      { week: 'Session 4', topic: 'Organic Color Infill & Completion', details: 'Natural color saturation and signature finishing touch.' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    seatsLeft: 9,
    rating: 4.92,
    reviewsCount: 98
  },
  {
    id: 'gond-forest-art-masterclass',
    title: 'Gond Tribal Art: Rhythm of the Forest',
    artForm: 'Gond',
    instructorName: 'Master Artisan Ram Singh Urveti',
    instructorTitle: 'Renowned Gond Visual Artist',
    instructorImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
    region: 'Dindori, Madhya Pradesh',
    level: 'Intermediate',
    startDate: 'Sat, Nov 02, 2026',
    duration: '3 Weeks • 6 Live Sessions',
    sessionsCount: 6,
    priceWithKit: 2899,
    priceDigitalOnly: 1499,
    kitIncluded: [
      'Heavyweight 300 GSM Archival Canvas Sheets',
      'Professional Acrylic & Mineral Pigments',
      'Custom Pattern Dotting & Linework Brushes',
      'Traditional Gond Motif Stencils & Color Guide'
    ],
    syllabus: [
      { week: 'Week 1', topic: 'Gond Mythology & Signature Patterns', details: 'Discovering tribal folk tales of trees and animals; learning the 7 fundamental dotting styles.' },
      { week: 'Week 2', topic: 'The Great Hornbill & Forest Spirits', details: 'Layering deep earth tones and building complex pattern textures across organic silhouettes.' },
      { week: 'Week 3', topic: 'Mastering Negative Space & Harmony', details: 'Balancing vibrant contrasting shades and sealing the artwork for lifetime archival quality.' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=800&q=80',
    seatsLeft: 4,
    rating: 4.98,
    reviewsCount: 76
  },
  {
    id: 'tanjore-gold-foil-intensive',
    title: 'Tanjore Classical Art: 24K Gold Foil Gesso Relief',
    artForm: 'Tanjore',
    instructorName: 'Master S. Kumar',
    instructorTitle: 'Master Artisan, Thanjavur Guild',
    instructorImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    region: 'Thanjavur, Tamil Nadu',
    level: 'Master Level',
    startDate: 'Sun, Nov 10, 2026',
    duration: '4 Weeks • 8 Live Sessions',
    sessionsCount: 8,
    priceWithKit: 4999,
    priceDigitalOnly: 2299,
    kitIncluded: [
      'Seasoned Teak Ply Board with Pure Cotton Canvas Coating',
      'Traditional Limestone Chalk Powder & Arabic Gum',
      'Booklet of 20 Certified 24K Gold Foil Sheets',
      'Jaipur Cut Glass Gemstones & Amber Cabochons',
      'Squeeze Cones & Carving Sculpting Styluses'
    ],
    syllabus: [
      { week: 'Week 1', topic: 'Plywood Prepping & Iconographic Sketching', details: 'Tracing classical divine iconography onto canvas and mixing archival glue gesso.' },
      { week: 'Week 2', topic: 'Three-Dimensional Gesso Relief Embossing', details: 'Piping ornate temple pillars, thrones, and crowns using fine gesso cones.' },
      { week: 'Week 3', topic: 'Gemstone Inlay & 24K Gold Foil Gilding', details: 'Embedding gemstones and meticulously adhering delicate pure gold foil.' },
      { week: 'Week 4', topic: 'Traditional Tempera Color Shading', details: 'Painting eyes, drapery, and finalizing classical Chettinad framing.' }
    ],
    thumbnail: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=800&q=80',
    seatsLeft: 3,
    rating: 5.0,
    reviewsCount: 112
  }
];
