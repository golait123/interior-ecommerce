import { CustomizerDesign } from '../models/CustomizerDesign';
import { ProductReview } from '../models/ProductReview';
import { AiChatSession } from '../models/AiChatSession';

export async function seedMongoInitialData() {
  try {
    // 1. Seed sample reviews if empty
    const reviewCount = await ProductReview.countDocuments();
    if (reviewCount === 0) {
      console.log('🌱 Seeding initial customer reviews into MongoDB...');
      await ProductReview.create([
        {
          productId: 'prod-indoor-plant-bundle',
          productName: 'NASA Air-Purifying Indoor Plants Set of 4',
          userId: 'user-sample-customer-1',
          userName: 'Priya Sharma (Bangalore)',
          userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
          rating: 5,
          title: 'Arrived in pristine condition! Exceeded expectations.',
          comment: 'The plants arrived in breathable packaging with damp potting soil and sturdy terracotta planters. The Sansevieria and Peace Lily are thriving on my east-facing balcony.',
          verifiedPurchase: true,
          productType: 'Plants',
          media: [
            {
              url: '/images/indoor-plants.jpg',
              type: 'IMAGE',
              caption: 'My living room balcony setup after 2 weeks'
            }
          ],
          attributes: {
            quality: 5,
            packaging: 5,
            plantHealth: 5,
            easyToInstall: 5
          },
          helpfulCount: 24,
          helpfulVotes: ['vote-1', 'vote-2'],
          replies: [
            {
              author: 'Dr. Ramesh (Chief Horticulturalist)',
              role: 'STORE_MANAGER',
              message: 'Thank you Priya! Be sure to mist the Peace Lily once a week during summer.',
              createdAt: new Date()
            }
          ],
          isApproved: true
        },
        {
          productId: 'prod-indoor-plant-bundle',
          productName: 'NASA Air-Purifying Indoor Plants Set of 4',
          userId: 'user-sample-customer-2',
          userName: 'Arjun Verma (Mumbai)',
          userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
          rating: 5,
          title: 'Transformational green aesthetic for my apartment',
          comment: 'Selected this through the bespoke Nursery Customizer. The curated mix of foliage and glazed ceramic planters elevated our modern living room corner effortlessly.',
          verifiedPurchase: true,
          productType: 'Plants',
          media: [
            {
              url: '/images/plant-pot.jpg',
              type: 'IMAGE',
              caption: 'Ceramic planter detail'
            }
          ],
          attributes: {
            quality: 5,
            packaging: 5,
            plantHealth: 5,
            easyToInstall: 5
          },
          helpfulCount: 18,
          helpfulVotes: ['vote-3'],
          isApproved: true
        },
        {
          productId: 'prod-ceramic-planter-fluted',
          productName: 'Handcrafted Fluted Matte Ceramic Planter',
          userId: 'user-sample-customer-3',
          userName: 'Sunita Mehra (Delhi)',
          rating: 5,
          title: 'Heavy, premium terracotta craftsmanship',
          comment: 'Has proper drainage holes and a matching saucer. Looks far more expensive than its price tag. Pairs beautifully with snake plants.',
          verifiedPurchase: true,
          productType: 'Planters',
          attributes: {
            quality: 5,
            packaging: 4,
            plantHealth: 5,
            easyToInstall: 5
          },
          helpfulCount: 9,
          helpfulVotes: [],
          isApproved: true
        }
      ]);
      console.log('✅ MongoDB sample customer reviews seeded successfully');
    }

    // 2. Seed sample customizer designs if empty
    const designCount = await CustomizerDesign.countDocuments();
    if (designCount === 0) {
      console.log('🌱 Seeding sample customizer design into MongoDB...');
      await CustomizerDesign.create({
        title: 'Penthouse Emerald Balcony Sanctuary',
        designType: 'NURSERY_GARDEN',
        status: 'SAVED',
        shareSlug: 'balcony-eden-sanctuary-demo',
        isPublic: true,
        thumbnailUrl: '/images/outdoor-garden.jpg',
        previewImage: '/images/outdoor-garden.jpg',
        dimensions: {
          width: 12,
          length: 6,
          height: 10,
          areaSqFt: 72,
          unit: 'ft'
        },
        totalEstimatedCost: 8999,
        currency: '₹',
        metadata: {
          spaceType: 'Apartment Balcony Sanctuary',
          sunlightOrientation: 'Morning Gentle Sun (East Facing)',
          plantPack: 'NASA Certified Air Detox Cleanse Pack',
          plantCount: 6,
          includedPlants: [
            'Variegated Snake Plant (Sansevieria Trifasciata)',
            'Golden Pothos Money Plant Vine',
            'Spathiphyllum Peace Lily Bloom',
            'Areca Palm Microclimate Fronds',
            'Chlorophytum Spider Plant',
            'ZZ Plant (Zamioculcas Zamiifolia)'
          ],
          planterType: 'Handcrafted Terracotta Pots with Natural Breathable Porosity',
          addonsSelected: [
            'Neem Oil Organic Pest Spray',
            'Slow-Release Botanical Nutrient Spikes',
            'Moisture Sensor Stick'
          ],
          nurseryNotes: 'Commissioned for high-rise morning balcony aerated setup.'
        },
        tags: ['Balcony', 'Air Purifier', 'Terracotta', 'Bespoke Nursery'],
        version: 1
      });
      console.log('✅ MongoDB sample customizer designs seeded successfully');
    }
  } catch (err: any) {
    console.warn('MongoDB initial data seed notice:', err?.message || err);
  }
}
