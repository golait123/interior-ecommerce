import { Router } from 'express';
import { z } from 'zod';
import { CustomizerDesign } from '../models/CustomizerDesign';
import { auth, AuthReq } from '../middleware/auth';
import { UserActivityLog } from '../models/UserActivityLog';

const router = Router();

// Helper to generate readable share slug
function generateSlug(prefix: string) {
  const rand = Math.random().toString(36).substring(2, 8);
  const cleanPrefix = prefix.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `${cleanPrefix}-${rand}`;
}

const saveDesignSchema = z.object({
  title: z.string().min(2).max(120),
  designType: z.enum(['NURSERY_GARDEN', 'CUSTOM_WALLPAPER', 'ROOM_VISUALIZER', 'ROOM_PANORAMA']),
  status: z.enum(['DRAFT', 'SAVED', 'ORDERED', 'ARCHIVED']).default('SAVED'),
  isPublic: z.boolean().default(false),
  thumbnailUrl: z.string().optional(),
  previewImage: z.string().optional(),
  dimensions: z.object({
    width: z.number().optional(),
    length: z.number().optional(),
    height: z.number().optional(),
    areaSqFt: z.number().optional(),
    unit: z.string().default('ft')
  }).optional(),
  totalEstimatedCost: z.number().default(0),
  currency: z.string().default('₹'),
  metadata: z.record(z.string(), z.any()).default({}),
  tags: z.array(z.string()).default([])
});

// 1. Create or Save a Customizer Design in MongoDB
router.post('/', async (req: AuthReq, res, next) => {
  try {
    const body = saveDesignSchema.parse(req.body);
    const userId = req.user?.id || (req.headers['x-user-id'] as string) || undefined;
    const userEmail = (req.body.userEmail as string) || undefined;

    const baseSlug = body.title.slice(0, 24);
    const shareSlug = generateSlug(baseSlug || body.designType);

    const design = await CustomizerDesign.create({
      ...body,
      userId,
      userEmail,
      shareSlug,
      version: 1
    });

    // Asynchronously log telemetry
    UserActivityLog.create({
      userId,
      eventType: 'CUSTOMIZER_COMMISSIONED',
      entityType: 'CustomizerDesign',
      entityId: design._id.toString(),
      page: req.originalUrl,
      details: {
        designType: body.designType,
        totalCost: body.totalEstimatedCost,
        title: body.title
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(() => {});

    return res.status(201).json({
      success: true,
      message: 'Design saved successfully to MongoDB',
      data: design
    });
  } catch (err) {
    next(err);
  }
});

// 2. List user's saved designs (or public designs)
router.get('/', async (req: AuthReq, res, next) => {
  try {
    const userId = req.user?.id || (req.query.userId as string);
    const designType = req.query.designType as string;
    const status = req.query.status as string;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};
    if (userId) {
      query.userId = userId;
    } else {
      query.isPublic = true;
    }
    if (designType) query.designType = designType;
    if (status) query.status = status;

    const [items, total] = await Promise.all([
      CustomizerDesign.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CustomizerDesign.countDocuments(query)
    ]);

    return res.json({
      success: true,
      message: 'Designs retrieved successfully',
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
});

// 3. View public shared design by shareSlug
router.get('/share/:shareSlug', async (req, res, next) => {
  try {
    const design = await CustomizerDesign.findOne({ shareSlug: req.params.shareSlug }).lean();
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    return res.json({
      success: true,
      message: 'Shared design retrieved',
      data: design
    });
  } catch (err) {
    next(err);
  }
});

// 4. Get specific design by MongoDB _id
router.get('/:id', async (req, res, next) => {
  try {
    const design = await CustomizerDesign.findById(req.params.id).lean();
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    return res.json({
      success: true,
      message: 'Design retrieved',
      data: design
    });
  } catch (err) {
    next(err);
  }
});

// 5. Update saved design
router.put('/:id', async (req: AuthReq, res, next) => {
  try {
    const updates = req.body;
    const design = await CustomizerDesign.findById(req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    // Apply allowed updates
    if (updates.title) design.title = updates.title;
    if (updates.status) design.status = updates.status;
    if (updates.isPublic !== undefined) design.isPublic = updates.isPublic;
    if (updates.dimensions) design.dimensions = { ...design.dimensions, ...updates.dimensions };
    if (updates.totalEstimatedCost !== undefined) design.totalEstimatedCost = updates.totalEstimatedCost;
    if (updates.metadata) design.metadata = { ...design.metadata, ...updates.metadata };
    if (updates.thumbnailUrl) design.thumbnailUrl = updates.thumbnailUrl;
    if (updates.previewImage) design.previewImage = updates.previewImage;
    if (updates.tags) design.tags = updates.tags;

    design.version = (design.version || 1) + 1;
    await design.save();

    return res.json({
      success: true,
      message: 'Design updated successfully',
      data: design
    });
  } catch (err) {
    next(err);
  }
});

// 6. Delete saved design
router.delete('/:id', async (req, res, next) => {
  try {
    const design = await CustomizerDesign.findByIdAndDelete(req.params.id);
    if (!design) {
      return res.status(404).json({ success: false, message: 'Design not found' });
    }

    return res.json({
      success: true,
      message: 'Design deleted successfully'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
