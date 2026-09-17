import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, roles, AuthReq } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
router.use(auth);
router.use(roles(Role.CUSTOMER));

router.get('/', async (req: AuthReq, res, next) => {
  try {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.id } });
    res.json({ success: true, message: 'Addresses retrieved', data: addresses });
  } catch (error) { next(error); }
});

router.post('/', async (req: AuthReq, res, next) => {
  try {
    const schema = z.object({
      line1: z.string(),
      line2: z.string().optional(),
      city: z.string(),
      state: z.string(),
      postalCode: z.string(),
      country: z.string().optional()
    });
    const data = schema.parse(req.body);

    const address = await prisma.address.create({
      data: { ...data, userId: req.user!.id }
    });

    res.json({ success: true, message: 'Address created', data: address });
  } catch (error) { next(error); }
});

router.put('/:id', async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    const schema = z.object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional()
    });
    const data = schema.parse(req.body);

    const updated = await prisma.address.update({
      where: { id },
      data
    });

    res.json({ success: true, message: 'Address updated', data: updated });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== req.user!.id) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await prisma.address.delete({ where: { id } });
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) { next(error); }
});

export default router;
