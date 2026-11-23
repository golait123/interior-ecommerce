import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ARSession } from '../models/ARSession';
import { auth, roles, AuthReq } from '../middleware/auth';
import { Role } from '@prisma/client';
import crypto from 'crypto';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'interiorg-edge-secret-key-at-least-32-chars-long!';

const optionalAuth = (req: AuthReq, _res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = { id: decoded.sub, role: decoded.role };
    } catch {
      // Ignored for optional auth
    }
  }
  next();
};

// POST /api/v1/ar-sessions - Initialize or record a new AR Session
router.post('/', optionalAuth, async (req: AuthReq, res: Response) => {
  try {
    const {
      sessionId = `ar-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      productId,
      productName,
      modelUrl,
      dimensions,
      deviceInfo,
      transform,
      status = 'initiated',
      metadata
    } = req.body;

    if (!productId || !productName) {
      return res.status(400).json({
        success: false,
        message: 'productId and productName are required to start an AR session'
      });
    }

    const session = await ARSession.create({
      sessionId,
      userId: req.user?.id,
      productId,
      productName,
      modelUrl,
      dimensions: dimensions || { width: 1.0, height: 0.8, depth: 0.9, unit: 'm' },
      deviceInfo: {
        userAgent: deviceInfo?.userAgent || req.headers['user-agent'],
        platform: deviceInfo?.platform || 'Web',
        isXRSupported: Boolean(deviceInfo?.isXRSupported),
        screenResolution: deviceInfo?.screenResolution,
        mode: deviceInfo?.mode || 'CAMERA_SIMULATION'
      },
      transform: transform || {
        position: { x: 0, y: 0, z: -1.5 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1.0, y: 1.0, z: 1.0 }
      },
      status,
      interactions: {
        placementsCount: 0,
        rotationsCount: 0,
        scaleChangesCount: 0,
        snapshotsCount: 0
      },
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'AR session initiated successfully',
      data: session
    });
  } catch (error: any) {
    console.error('Error creating AR session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create AR session'
    });
  }
});

// GET /api/v1/ar-sessions - List AR sessions and aggregate metrics
router.get('/', optionalAuth, async (req: AuthReq, res: Response) => {
  try {
    const { productId, status, limit = 50, page = 1 } = req.query;
    const filter: Record<string, any> = {};

    if (productId) filter.productId = String(productId);
    if (status) filter.status = String(status);
    if (req.user && req.user.role !== Role.ADMIN) {
      filter.userId = req.user.id;
    }

    const limitNum = Math.min(Number(limit) || 50, 100);
    const skipNum = ((Number(page) || 1) - 1) * limitNum;

    const [sessions, total] = await Promise.all([
      ARSession.find(filter)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .lean(),
      ARSession.countDocuments(filter)
    ]);

    // Compute metrics
    const placedCount = await ARSession.countDocuments({ ...filter, status: { $in: ['placed', 'ended'] } });
    const cartCount = await ARSession.countDocuments({ ...filter, cartAdded: true });

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          total,
          page: Number(page) || 1,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        },
        metrics: {
          totalSessions: total,
          placedCount,
          placementRate: total > 0 ? Number(((placedCount / total) * 100).toFixed(1)) : 0,
          cartConversionCount: cartCount,
          cartConversionRate: total > 0 ? Number(((cartCount / total) * 100).toFixed(1)) : 0
        }
      }
    });
  } catch (error: any) {
    console.error('Error listing AR sessions:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list AR sessions'
    });
  }
});

// GET /api/v1/ar-sessions/:id - Get specific session by sessionId or _id
router.get('/:id', optionalAuth, async (req: AuthReq, res: Response) => {
  try {
    const id = String(req.params.id);
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    const session = await ARSession.findOne({
      $or: [{ sessionId: id }, ...(isMongoId ? [{ _id: id }] : [])]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'AR session not found'
      });
    }

    res.json({
      success: true,
      data: session
    });
  } catch (error: any) {
    console.error('Error fetching AR session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch AR session'
    });
  }
});

// PUT /api/v1/ar-sessions/:id - Update session interactions, duration, placement, cart
router.put('/:id', optionalAuth, async (req: AuthReq, res: Response) => {
  try {
    const id = String(req.params.id);
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const {
      sessionDurationSeconds,
      interactions,
      transform,
      status,
      cartAdded,
      snapshotUrl,
      metadata
    } = req.body;

    const session = await ARSession.findOne({
      $or: [{ sessionId: id }, ...(isMongoId ? [{ _id: id }] : [])]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'AR session not found'
      });
    }

    if (sessionDurationSeconds !== undefined) {
      session.sessionDurationSeconds = Math.max(session.sessionDurationSeconds, Number(sessionDurationSeconds));
    }

    if (interactions) {
      if (interactions.placementsCount !== undefined) {
        session.interactions.placementsCount = Number(interactions.placementsCount);
      }
      if (interactions.rotationsCount !== undefined) {
        session.interactions.rotationsCount = Number(interactions.rotationsCount);
      }
      if (interactions.scaleChangesCount !== undefined) {
        session.interactions.scaleChangesCount = Number(interactions.scaleChangesCount);
      }
      if (interactions.snapshotsCount !== undefined) {
        session.interactions.snapshotsCount = Number(interactions.snapshotsCount);
      }
    }

    if (transform) {
      if (transform.position) session.transform.position = { ...session.transform.position, ...transform.position };
      if (transform.rotation) session.transform.rotation = { ...session.transform.rotation, ...transform.rotation };
      if (transform.scale) session.transform.scale = { ...session.transform.scale, ...transform.scale };
    }

    if (status) {
      session.status = status;
    }

    if (cartAdded !== undefined) {
      session.cartAdded = Boolean(cartAdded);
    }

    if (snapshotUrl) {
      session.snapshotUrl = snapshotUrl;
    }

    if (metadata) {
      session.metadata = { ...session.metadata, ...metadata };
    }

    await session.save();

    res.json({
      success: true,
      message: 'AR session updated',
      data: session
    });
  } catch (error: any) {
    console.error('Error updating AR session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update AR session'
    });
  }
});

// DELETE /api/v1/ar-sessions/:id - Remove an AR session (admin only)
router.delete('/:id', auth, roles(Role.ADMIN), async (req: AuthReq, res: Response) => {
  try {
    const id = String(req.params.id);
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    const result = await ARSession.deleteOne({
      $or: [{ sessionId: id }, ...(isMongoId ? [{ _id: id }] : [])]
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'AR session not found'
      });
    }

    res.json({
      success: true,
      message: 'AR session deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting AR session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete AR session'
    });
  }
});

export default router;
