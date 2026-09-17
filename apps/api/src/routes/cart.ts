import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, roles, AuthReq } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();
router.use(auth);
router.use(roles(Role.CUSTOMER));

const calculateSubtotal = (cart: any) => {
  const subtotal = cart.items.reduce((sum: number, item: any) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + (Number(price) * item.quantity);
  }, 0);
  return { ...cart, subtotal };
};

router.get('/', async (req: AuthReq, res, next) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { items: { include: { product: true } } }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user!.id },
        include: { items: { include: { product: true } } }
      });
    }

    res.json({ success: true, message: 'Cart retrieved', data: calculateSubtotal(cart) });
  } catch (error) { next(error); }
});

router.post('/items', async (req: AuthReq, res, next) => {
  try {
    const schema = z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      customization: z.any().optional()
    });
    const { productId, quantity, customization } = schema.parse(req.body);

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId: req.user!.id } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId }
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          customization: customization || {}
        }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json({ success: true, message: 'Item added', data: calculateSubtotal(updatedCart) });
  } catch (error) { next(error); }
});

router.patch('/items/:itemId', async (req: AuthReq, res, next) => {
  try {
    const itemId = String(req.params.itemId);
    const schema = z.object({ quantity: z.number().int().min(0) });
    const { quantity } = schema.parse(req.body);

    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity }
      });
    }

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json({ success: true, message: 'Item updated', data: calculateSubtotal(updatedCart) });
  } catch (error) { next(error); }
});

router.delete('/items/:itemId', async (req: AuthReq, res, next) => {
  try {
    const itemId = String(req.params.itemId);
    
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = await prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cart.id) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    await prisma.cartItem.delete({ where: { id: itemId } });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json({ success: true, message: 'Item removed', data: calculateSubtotal(updatedCart) });
  } catch (error) { next(error); }
});

router.delete('/', async (req: AuthReq, res, next) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: { items: { include: { product: true } } }
    });

    res.json({ success: true, message: 'Cart cleared', data: calculateSubtotal(updatedCart) });
  } catch (error) { next(error); }
});

export default router;
