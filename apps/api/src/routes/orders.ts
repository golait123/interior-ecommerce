import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, roles, AuthReq } from '../middleware/auth';
import { Role, OrderStatus, InventoryTxnType } from '@prisma/client';

const router = Router();
router.use(auth);

router.post('/', roles(Role.CUSTOMER), async (req: AuthReq, res, next) => {
  try {
    const schema = z.object({
      addressId: z.string(),
      items: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive().max(1000),
        customization: z.any().optional()
      })).min(1)
    });
    const { addressId, items } = schema.parse(req.body);

    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const inventory = await tx.inventory.findUnique({
          where: { productId: item.productId }
        });
        
        if (!inventory) throw new Error(`Inventory not found for product ${item.productId}`);
        const available = inventory.totalQuantity - inventory.reservedQuantity - inventory.damagedQuantity;
        if (available < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found ${item.productId}`);

        await tx.inventory.update({
          where: { id: inventory.id },
          data: { reservedQuantity: { increment: item.quantity } }
        });

        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            type: InventoryTxnType.ORDER_RESERVED,
            quantity: item.quantity,
            previousQuantity: inventory.totalQuantity,
            newQuantity: inventory.totalQuantity,
            performedBy: req.user!.id,
            referenceId: 'Order placed'
          }
        });

        const cust = item.customization;
        let price = Number(product.discountPrice ?? product.price);
        if (cust) {
          if (typeof cust.unitPrice === 'number' && cust.unitPrice > 0) price = cust.unitPrice;
          else if (typeof cust.customPrice === 'number' && cust.customPrice > 0) price = cust.customPrice;
          else if (typeof cust.materialCost === 'number' && cust.materialCost > 0) price = cust.materialCost;
          else if (typeof cust.materialSubtotal === 'number' && cust.materialSubtotal > 0) price = cust.materialSubtotal;
          else if (typeof cust.subtotal === 'number' && cust.subtotal > 0 && item.quantity > 0) price = Math.round(cust.subtotal / item.quantity);
        }
        subtotal += price * item.quantity;

        orderItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: price,
          customization: item.customization || {}
        });
      }

      const tax = Math.round(subtotal * 0.18);
      const total = subtotal + tax;

      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          addressId,
          orderNumber: `ORD-${Date.now()}`,
          subtotal,
          tax,
          delivery: 0,
          discount: 0,
          total,
          status: OrderStatus.PENDING,
          items: { create: orderItemsData },
          payment: { create: { amount: total, provider: 'mock' } }
        }
      });
      return newOrder;
    }, { isolationLevel: 'Serializable' });

    res.json({ success: true, message: 'Order created', data: order });
  } catch (error) { next(error); }
});

router.get('/', async (req: AuthReq, res, next) => {
  try {
    const where = req.user!.role === Role.CUSTOMER ? { userId: req.user!.id } : {};
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        payment: true,
        address: true,
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, message: 'Orders retrieved', data: orders });
  } catch (error) { next(error); }
});

router.get('/:id', async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
        address: true
      }
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user!.role === Role.CUSTOMER && order.userId !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, message: 'Order retrieved', data: order });
  } catch (error) { next(error); }
});

router.patch('/:id/status', roles(Role.ADMIN, Role.STOCK_MANAGER), async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const schema = z.object({ status: z.nativeEnum(OrderStatus) });
    const { status } = schema.parse(req.body);

    const order = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { items: true }
      });
      
      if (!existing) throw new Error('Order not found');

      if (status === OrderStatus.CANCELLED && existing.status !== OrderStatus.CANCELLED) {
        for (const item of existing.items) {
          const inventory = await tx.inventory.findUnique({ where: { productId: item.productId } });
          if (inventory) {
            await tx.inventory.update({
              where: { id: inventory.id },
              data: { reservedQuantity: { decrement: item.quantity } }
            });
            await tx.inventoryTransaction.create({
              data: {
                inventoryId: inventory.id,
                type: InventoryTxnType.ORDER_CANCELLED,
                quantity: item.quantity,
                previousQuantity: inventory.totalQuantity,
                newQuantity: inventory.totalQuantity,
                performedBy: req.user!.id,
                referenceId: `Order ${existing.orderNumber} cancelled`
              }
            });
          }
        }
      }

      const updated = await tx.order.update({
        where: { id },
        data: { status }
      });

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'UPDATE_ORDER_STATUS',
          entityType: 'ORDER',
          entityId: updated.id,
          newValue: { oldStatus: existing.status, newStatus: status }
        }
      });

      return updated;
    });

    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (error) { next(error); }
});

router.patch('/:id/items/:itemId/customization', roles(Role.ADMIN, Role.STOCK_MANAGER), async (req: AuthReq, res, next) => {
  try {
    const id = String(req.params.id);
    const itemId = String(req.params.itemId);
    const schema = z.object({
      customization: z.record(z.string(), z.any())
    });
    const { customization } = schema.parse(req.body);

    const orderItem = await prisma.orderItem.findUnique({
      where: { id: itemId }
    });

    if (!orderItem || orderItem.orderId !== id) {
      return res.status(404).json({ success: false, message: 'Order item not found' });
    }

    const currentCust = (typeof orderItem.customization === 'object' && orderItem.customization !== null)
      ? (orderItem.customization as Record<string, any>)
      : {};

    const mergedCustomization = {
      ...currentCust,
      ...customization,
      lastUpdatedBy: {
        userId: req.user!.id,
        role: req.user!.role,
        updatedAt: new Date().toISOString()
      }
    };

    await prisma.orderItem.update({
      where: { id: itemId },
      data: { customization: mergedCustomization }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_ORDER_ITEM_CUSTOMIZATION',
        entityType: 'ORDER_ITEM',
        entityId: itemId,
        newValue: customization
      }
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        payment: true,
        address: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    res.json({ success: true, message: 'Order item customization & tracking updated', data: fullOrder });
  } catch (error) { next(error); }
});

export default router;
