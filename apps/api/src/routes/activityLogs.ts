import { Router } from 'express';
import { UserActivityLog } from '../models/UserActivityLog';
import { AuthReq } from '../middleware/auth';

const router = Router();

// 1. Record an interaction event
router.post('/event', async (req: AuthReq, res) => {
  try {
    const { eventType, entityType, entityId, page, details, sessionId } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!eventType) {
      return res.status(400).json({ success: false, message: 'eventType is required' });
    }

    // Insert asynchronously into MongoDB
    UserActivityLog.create({
      userId,
      sessionId,
      eventType,
      entityType,
      entityId,
      page,
      details: details || {},
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    }).catch(err => console.warn('Activity log write error:', err.message));

    return res.status(202).json({ success: true, message: 'Event logged' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || 'Error logging event' });
  }
});

// 2. Telemetry Insights Dashboard for Admin
router.get('/insights', async (_req, res, next) => {
  try {
    const [eventCounts, topProducts, recentEvents] = await Promise.all([
      UserActivityLog.aggregate([
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      UserActivityLog.aggregate([
        { $match: { eventType: 'PRODUCT_VIEWED', entityId: { $exists: true, $ne: null } } },
        { $group: { _id: '$entityId', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ]),
      UserActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
    ]);

    return res.json({
      success: true,
      data: {
        eventCounts,
        topProducts,
        recentEvents
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
