import { Router } from 'express';
import { z } from 'zod';
import { AiChatSession } from '../models/AiChatSession';
import { AuthReq } from '../middleware/auth';

const router = Router();

// 1. Create or retrieve an AI Consultation Session
router.post('/session', async (req: AuthReq, res, next) => {
  try {
    const { sessionId, roomContext, sessionTitle } = req.body;
    const userId = req.user?.id || req.body.userId;
    const userEmail = req.user?.id ? undefined : req.body.userEmail;

    let session = null;
    if (sessionId) {
      session = await AiChatSession.findOne({ sessionId });
    }

    if (!session) {
      const generatedId = sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      session = await AiChatSession.create({
        sessionId: generatedId,
        userId,
        userEmail,
        sessionTitle: sessionTitle || 'Interior & Botanical Design Consultation',
        roomContext: roomContext || {},
        messages: [
          {
            role: 'assistant',
            content: 'Hello! I am your InteriorG AI Botanical & Interior Design Stylist. How can I assist you with your space, plant choices, or wall canvas today?',
            timestamp: new Date()
          }
        ]
      });
    }

    return res.json({
      success: true,
      message: 'Chat session active',
      data: session
    });
  } catch (err) {
    next(err);
  }
});

// 2. Fetch Session by ID
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const session = await AiChatSession.findOne({ sessionId: req.params.sessionId }).lean();
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    return res.json({
      success: true,
      data: session
    });
  } catch (err) {
    next(err);
  }
});

// 3. Append User Message & Assistant Response
router.post('/session/:sessionId/message', async (req, res, next) => {
  try {
    const { userMessage, assistantMessage, suggestedProducts, generatedImages, visualizerHotspots } = req.body;
    if (!userMessage && !assistantMessage) {
      return res.status(400).json({ success: false, message: 'Message content is required' });
    }

    const session = await AiChatSession.findOne({ sessionId: req.params.sessionId });
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (userMessage) {
      session.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });
    }

    if (assistantMessage) {
      session.messages.push({
        role: 'assistant',
        content: assistantMessage,
        suggestedProducts: suggestedProducts || [],
        generatedImages: generatedImages || [],
        visualizerHotspots: visualizerHotspots || [],
        timestamp: new Date()
      });
    }

    await session.save();

    return res.json({
      success: true,
      message: 'Messages saved to conversation history',
      data: session
    });
  } catch (err) {
    next(err);
  }
});

// 4. List user's consultation history
router.get('/user-history', async (req: AuthReq, res, next) => {
  try {
    const userId = req.user?.id || (req.query.userId as string);
    if (!userId) {
      return res.json({ success: true, data: [] });
    }

    const sessions = await AiChatSession.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();

    return res.json({
      success: true,
      data: sessions
    });
  } catch (err) {
    next(err);
  }
});

export default router;
