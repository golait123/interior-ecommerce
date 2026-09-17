"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.use((0, auth_1.roles)(client_1.Role.ADMIN, client_1.Role.STOCK_MANAGER));
router.get('/', async (req, res, next) => {
    try {
        const inventories = await prisma_1.prisma.inventory.findMany({ include: { product: true } });
        const formatted = inventories.map(inv => {
            const available = inv.totalQuantity - inv.reservedQuantity - inv.damagedQuantity;
            return { ...inv, available, isLowStock: available <= inv.reorderLevel };
        });
        res.json({ success: true, message: 'Inventory retrieved', data: formatted });
    }
    catch (error) {
        next(error);
    }
});
router.get('/alerts', async (req, res, next) => {
    try {
        const inventories = await prisma_1.prisma.inventory.findMany({ include: { product: true } });
        const alerts = inventories
            .map(inv => {
            const available = inv.totalQuantity - inv.reservedQuantity - inv.damagedQuantity;
            return { ...inv, available, isLowStock: available <= inv.reorderLevel };
        })
            .filter(inv => inv.available <= inv.reorderLevel);
        res.json({ success: true, message: 'Alerts retrieved', data: alerts });
    }
    catch (error) {
        next(error);
    }
});
router.get('/transactions', async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const productId = req.query.productId;
        const where = productId ? { inventory: { productId } } : {};
        const [items, total] = await Promise.all([
            prisma_1.prisma.inventoryTransaction.findMany({
                where, skip, take: limit,
                include: { user: { select: { name: true, email: true } }, inventory: { include: { product: true } } },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.inventoryTransaction.count({ where })
        ]);
        res.json({ success: true, message: 'Transactions retrieved', data: { items, total, page, limit } });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:productId', async (req, res, next) => {
    try {
        const productId = String(req.params.productId);
        const inventory = await prisma_1.prisma.inventory.findUnique({
            where: { productId },
            include: {
                product: true,
                transactions: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                    include: { user: { select: { name: true } } }
                }
            }
        });
        if (!inventory)
            return res.status(404).json({ success: false, message: 'Inventory not found' });
        const available = inventory.totalQuantity - inventory.reservedQuantity - inventory.damagedQuantity;
        res.json({ success: true, message: 'Inventory retrieved', data: { ...inventory, available } });
    }
    catch (error) {
        next(error);
    }
});
router.post('/mutate', async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            productId: zod_1.z.string(),
            quantity: zod_1.z.number().int().positive(),
            type: zod_1.z.enum(['STOCK_IN', 'STOCK_OUT', 'DAMAGE', 'ADJUSTMENT']),
            reason: zod_1.z.string().max(250).optional()
        });
        const { productId, quantity, type, reason } = schema.parse(req.body);
        const updated = await prisma_1.prisma.$transaction(async (tx) => {
            const inv = await tx.inventory.findUnique({ where: { productId } });
            if (!inv)
                throw new Error('Inventory not found');
            const available = inv.totalQuantity - inv.reservedQuantity - inv.damagedQuantity;
            let dataUpdate = {};
            let delta = quantity;
            if (type === 'STOCK_IN') {
                dataUpdate.totalQuantity = { increment: quantity };
            }
            else if (type === 'STOCK_OUT' || type === 'ADJUSTMENT') {
                if (available < quantity)
                    throw new Error('Insufficient stock for mutation');
                dataUpdate.totalQuantity = { decrement: quantity };
                delta = -quantity;
            }
            else if (type === 'DAMAGE') {
                if (available < quantity)
                    throw new Error('Insufficient stock for mutation');
                dataUpdate.damagedQuantity = { increment: quantity };
                delta = 0;
            }
            const updatedInv = await tx.inventory.update({
                where: { id: inv.id },
                data: dataUpdate,
                include: { product: true }
            });
            await tx.inventoryTransaction.create({
                data: {
                    inventoryId: inv.id,
                    type: type,
                    quantity,
                    previousQuantity: inv.totalQuantity,
                    newQuantity: updatedInv.totalQuantity,
                    performedBy: req.user.id,
                    referenceId: reason || null
                }
            });
            await tx.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'INVENTORY_MUTATION',
                    entityType: 'INVENTORY',
                    entityId: inv.id,
                    newValue: { type, quantity, reason }
                }
            });
            return updatedInv;
        });
        res.json({ success: true, message: 'Inventory mutated', data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
