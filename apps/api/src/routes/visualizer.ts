import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { 
  generateRoomPanoramaWithGemini, 
  analyzeRoomWithGeminiVision, 
  runGeminiImageAgent,
  restyleUploadedImageWithGemini,
  createGeminiLiveEphemeralToken,
  analyzeLiveVideoFrame
} from '../lib/gemini';

const router = Router();

// Ensure upload directory exists for visualizer designs
const designsUploadDir = path.resolve(process.cwd(), 'uploads', 'designs');
if (!fs.existsSync(designsUploadDir)) {
  fs.mkdirSync(designsUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, designsUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `design-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB for high-res panoramas & CAD files
  }
});

// 1. Upload Room Panorama or Room Photo
router.post('/upload', upload.single('designFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No room design file uploaded' });
  }

  const host = req.get('host');
  const protocol = req.protocol;
  const fileUrl = `${protocol}://${host}/uploads/designs/${req.file.filename}`;

  return res.json({
    success: true,
    message: 'Room panorama / photo uploaded successfully',
    data: {
      fileUrl,
      fileName: req.file.originalname,
      fileType: 'PANORAMA',
      fileSize: req.file.size
    }
  });
});

// 2. Gemini AI 360-Degree Panoramic Room Generation
router.post('/generate-360', async (req, res, next) => {
  try {
    const { roomType, style, wallpaper, dimensions, customPrompt } = req.body || {};
    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const result = await generateRoomPanoramaWithGemini(
      { roomType, style, wallpaper, dimensions, customPrompt },
      baseUrl
    );

    return res.json({
      success: true,
      message: '360° Real room panorama synthesized with Gemini AI image model',
      data: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        model: result.model,
        source: result.source,
        aspectRatio: result.aspectRatio,
        resolution: result.resolution,
        timestamp: new Date()
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. Gemini AI Image Agent Chat Endpoint
router.post('/agent-chat', async (req, res, next) => {
  try {
    const { message, cartItems, placedItems, roomContext, conversationHistory } = req.body || {};
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const result = await runGeminiImageAgent(
      {
        message,
        cartItems: cartItems || [],
        placedItems: placedItems || [],
        roomContext: roomContext || {},
        conversationHistory: conversationHistory || []
      },
      baseUrl
    );

    return res.json({
      success: true,
      message: 'Agent response generated successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// 4. Gemini Image Generation & Restyling for Uploaded Room Pictures
router.post('/restyle-image', async (req, res, next) => {
  try {
    const { imageBase64, imageFilePath, mimeType, prompt, style, apiKey } = req.body || {};
    if (!imageBase64 && !imageFilePath) {
      return res.status(400).json({ success: false, message: 'Image base64 or file path is required for restyling' });
    }

    const host = req.get('host');
    const protocol = req.protocol;
    const baseUrl = `${protocol}://${host}`;

    const result = await restyleUploadedImageWithGemini({
      imageBase64,
      imageFilePath,
      mimeType: mimeType || 'image/jpeg',
      prompt,
      style,
      apiKey,
      baseUrl
    });

    return res.json({
      success: true,
      message: 'Room image redesigned and restyled with Gemini Image Model',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// 5. Gemini Live API Ephemeral Token Generation
router.post('/live-token', async (req, res, next) => {
  try {
    const { apiKey } = req.body || {};
    const tokenResult = await createGeminiLiveEphemeralToken(apiKey);

    if (!tokenResult) {
      return res.status(503).json({
        success: false,
        message: 'Unable to provision ephemeral token. Please verify GEMINI_API_KEY or provide one in the request.'
      });
    }

    return res.json({
      success: true,
      message: 'Gemini Live ephemeral token generated successfully',
      data: tokenResult
    });
  } catch (err) {
    next(err);
  }
});

// 6. Gemini Live Video Real-Time Frame Multimodal Analysis
router.post('/live-frame-analysis', async (req, res, next) => {
  try {
    const { frameBase64, prompt, roomContext, apiKey } = req.body || {};
    if (!frameBase64) {
      return res.status(400).json({ success: false, message: 'Video frame base64 is required' });
    }

    const result = await analyzeLiveVideoFrame({
      frameBase64,
      prompt,
      roomContext,
      apiKey
    });

    return res.json({
      success: true,
      message: 'Live video frame analyzed successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
});

// Validation schema for room analysis
const analyzeSchema = z.object({
  designType: z.enum(['PANORAMA', 'ROOM_PHOTO']).default('PANORAMA'),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  mode: z.enum(['AUTO', 'MANUAL']).default('AUTO'),
  selectedProductIds: z.array(z.string()).optional(),
  roomType: z.string().optional(),
  dimensions: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    length: z.number().optional(),
    unit: z.enum(['ft', 'm']).default('ft'),
  }).optional(),
});

// 2. Room Intelligence & Color Harmony Analysis Endpoint
router.post('/analyze', async (req, res, next) => {
  try {
    const input = analyzeSchema.parse(req.body);

    // Fetch active catalog products from database
    const allProducts = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        inventory: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Determine dimensions & room area
    const width = input.dimensions?.width || 14;
    const height = input.dimensions?.height || 10;
    const length = input.dimensions?.length || 18;
    const primaryWallArea = Math.round(width * height);
    const totalWallArea = Math.round(2 * (width + length) * height * 0.85); // minus door/window allowances

    // Room color palette & mood definition
    let detectedStyle = 'Heritage Indian Bohemian';
    let roomPalette = [
      { name: 'Warm Terracotta / Sand', hex: '#D27D56', role: 'Dominant Accent' },
      { name: 'Linen Oat Cream', hex: '#EDE8DF', role: 'Primary Wall Base' },
      { name: 'Dark Sheesham Walnut', hex: '#3B2F2F', role: 'Wood Furniture Base' },
      { name: 'Antiqued Brass / Gold', hex: '#C4A462', role: 'Metallic Fixtures' },
      { name: 'Olive Desert Sage', hex: '#7A8B7B', role: 'Subtle Contrast' }
    ];

    // Attempt multimodal room understanding with Gemini Vision (gemini-3.7-flash)
    if (input.fileUrl && input.fileUrl.includes('/uploads/designs/')) {
      try {
        const localFileName = path.basename(input.fileUrl);
        const localFilePath = path.resolve(designsUploadDir, localFileName);
        if (fs.existsSync(localFilePath)) {
          const fileBuf = fs.readFileSync(localFilePath);
          const ext = path.extname(localFileName).toLowerCase();
          const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
          const visionAnalysis = await analyzeRoomWithGeminiVision(fileBuf.toString('base64'), mime);
          if (visionAnalysis) {
            if (visionAnalysis.detectedStyle) detectedStyle = visionAnalysis.detectedStyle;
            if (visionAnalysis.colorPalette && visionAnalysis.colorPalette.length > 0) {
              roomPalette = visionAnalysis.colorPalette;
            }
          }
        }
      } catch (visionErr) {
        console.warn('Gemini vision analysis skipped:', visionErr);
      }
    }

    let recommendedProducts: any[] = [];
    let wallpaperItem: any = null;

    if (input.mode === 'MANUAL' && input.selectedProductIds && input.selectedProductIds.length > 0) {
      // Manual mode: user selected specific products
      recommendedProducts = allProducts.filter(p => input.selectedProductIds!.includes(p.id));
      wallpaperItem = recommendedProducts.find(p => p.isCustomizable || p.category?.slug === 'wallpapers');
    } else {
      // AUTO mode: intelligent AI recommendation engine
      // Categorize products by characteristics
      const wallpapers = allProducts.filter(p => p.category?.slug === 'wallpapers' || p.isCustomizable);
      const lighting = allProducts.filter(p => p.category?.slug === 'artistic-lighting-chandeliers');
      const mirrors = allProducts.filter(p => p.category?.slug === 'mirrors-wall-decor');
      const furniture = allProducts.filter(p => p.category?.slug === 'handcrafted-wooden-furniture');
      const decor = allProducts.filter(p => 
        p.category?.slug === 'artisan-ceramic-vases' || 
        p.category?.slug === 'candle-stands-showpieces' || 
        p.category?.slug === 'aesthetic-decor'
      );

      // Assemble curated room bundle with diversity across architectural zones
      wallpaperItem = wallpapers[0] || allProducts[0];
      const bundle = [
        ...wallpapers.slice(0, 2),
        ...mirrors.slice(0, 2),
        ...lighting.slice(0, 2),
        ...furniture.slice(0, 2),
        ...decor.slice(0, 3)
      ].filter(Boolean);

      // Deduplicate products
      const uniqueMap = new Map<string, typeof allProducts[0]>();
      for (const item of bundle) {
        if (!uniqueMap.has(item.id)) uniqueMap.set(item.id, item);
      }
      recommendedProducts = Array.from(uniqueMap.values());
    }

    // Default positions and placement guidelines for each item in the room
    const categoryOffsets: Record<string, number> = {};
    const hotspots = recommendedProducts.map((p) => {
      const slug = p.category?.slug || '';
      const catCount = categoryOffsets[slug] || 0;
      categoryOffsets[slug] = catCount + 1;

      let placement = 'Focal Accent Surface';
      let x = 50; // percentage
      let y = 50;
      let yaw = 0; // degrees for 360 sphere
      let pitch = 0;

      if (slug === 'wallpapers' || p.isCustomizable) {
        placement = catCount === 0 ? 'Main Accent Wall' : 'Secondary Coordinated Wall';
        x = 52 + catCount * 14;
        y = 44;
        yaw = 10 + catCount * 22;
        pitch = 5;
      } else if (slug === 'artistic-lighting-chandeliers') {
        placement = catCount === 0 ? 'Ceiling Illumination Center' : 'Ambient Pendant Corner';
        x = 50 + catCount * 12;
        y = 20;
        yaw = 2 + catCount * 24;
        pitch = 30;
      } else if (slug === 'mirrors-wall-decor') {
        placement = catCount === 0 ? 'Statement Wall Mirror' : 'Gallery Feature Wall Art';
        x = 24 + catCount * 16;
        y = 48;
        yaw = -32 - catCount * 26;
        pitch = 8;
      } else if (slug === 'handcrafted-wooden-furniture') {
        placement = catCount === 0 ? 'Central Console Table' : 'Accent Coffee / Side Table';
        x = 38 + catCount * 15;
        y = 74;
        yaw = -22 - catCount * 24;
        pitch = -20;
      } else if (slug === 'artisan-ceramic-vases' || slug === 'candle-stands-showpieces' || slug === 'aesthetic-decor') {
        placement = catCount === 0 ? 'Console Tabletop Accent' : 'Decorative Floor Urn / Pedestal';
        x = 72 - catCount * 14;
        y = 66;
        yaw = 36 + catCount * 24;
        pitch = -14;
      } else {
        yaw = -45 + (catCount * 30);
        pitch = catCount % 2 === 0 ? 5 : -14;
      }

      return {
        productId: p.id,
        name: p.name,
        category: p.category?.name,
        price: p.discountPrice ? Number(p.discountPrice) : Number(p.price),
        image: p.images?.[0] || '',
        placement,
        role: placement,
        position: { x, y, yaw, pitch }
      };
    });

    // Calculate Wallpaper sizing and custom cost if wallpaper exists
    let wallpaperCostEstimate = null;
    if (wallpaperItem) {
      const pricePerSqFt = Number(wallpaperItem.pricePerSqFt || 38);
      const wastage = 1.10; // 10% wastage allowance
      const billableArea = Math.ceil(primaryWallArea * wastage);
      const materialCost = billableArea * pricePerSqFt;
      const tax = Math.round(materialCost * 0.18);
      const total = materialCost + tax;

      wallpaperCostEstimate = {
        productId: wallpaperItem.id,
        productName: wallpaperItem.name,
        wallWidth: width,
        wallHeight: height,
        areaSqFt: primaryWallArea,
        billableAreaSqFt: billableArea,
        pricePerSqFt,
        materialCost,
        tax,
        total
      };
    }

    // Calculate Total Room Makeover Bundle Price in ₹
    const totalBundlePrice = recommendedProducts.reduce((sum, p) => {
      const price = p.discountPrice ? Number(p.discountPrice) : Number(p.price);
      return sum + price;
    }, 0);

    return res.json({
      success: true,
      message: `Room analyzed successfully via ${input.mode} mode`,
      data: {
        designType: input.designType,
        mode: input.mode,
        roomType: input.roomType || 'Panoramic Living & Dining Hall',
        dimensions: {
          width,
          height,
          length,
          primaryWallAreaSqFt: primaryWallArea,
          totalWallAreaSqFt: totalWallArea
        },
        detectedStyle,
        colorPalette: roomPalette,
        wallpaperCostEstimate,
        hotspots,
        products: recommendedProducts.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          price: p.price,
          discountPrice: p.discountPrice,
          unit: p.unit,
          images: p.images,
          isCustomizable: p.isCustomizable,
          category: p.category ? { id: p.category.id, name: p.category.name, slug: p.category.slug } : null,
          inventoryAvailable: p.inventory ? Math.max(0, p.inventory.totalQuantity - p.inventory.reservedQuantity) : 50
        })),
        totalBundlePrice,
        currency: '₹'
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
