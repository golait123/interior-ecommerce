"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getItemUnitPrice = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.use((0, auth_1.roles)(client_1.Role.CUSTOMER));
const getItemUnitPrice = (item) => {
    const cust = item.customization;
    if (cust) {
        if (typeof cust.unitPrice === 'number' && cust.unitPrice > 0)
            return cust.unitPrice;
        if (typeof cust.customPrice === 'number' && cust.customPrice > 0)
            return cust.customPrice;
        if (typeof cust.materialCost === 'number' && cust.materialCost > 0)
            return cust.materialCost;
        if (typeof cust.materialSubtotal === 'number' && cust.materialSubtotal > 0)
            return cust.materialSubtotal;
        if (typeof cust.subtotal === 'number' && cust.subtotal > 0 && item.quantity > 0) {
            return Math.round(cust.subtotal / item.quantity);
        }
    }
    return Number(item.product?.discountPrice ?? item.product?.price ?? 0);
};
exports.getItemUnitPrice = getItemUnitPrice;
const calculateSubtotal = (cart) => {
    const subtotal = cart.items.reduce((sum, item) => {
        const price = (0, exports.getItemUnitPrice)(item);
        return sum + (price * item.quantity);
    }, 0);
    return { ...cart, subtotal };
};
router.get('/', async (req, res, next) => {
    try {
        let cart = await prisma_1.prisma.cart.findUnique({
            where: { userId: req.user.id },
            include: { items: { include: { product: true } } }
        });
        if (!cart) {
            cart = await prisma_1.prisma.cart.create({
                data: { userId: req.user.id },
                include: { items: { include: { product: true } } }
            });
        }
        res.json({ success: true, message: 'Cart retrieved', data: calculateSubtotal(cart) });
    }
    catch (error) {
        next(error);
    }
});
router.post('/items', async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            productId: zod_1.z.string(),
            quantity: zod_1.z.number().int().positive(),
            customization: zod_1.z.any().optional()
        });
        const { productId, quantity, customization } = schema.parse(req.body);
        let cart = await prisma_1.prisma.cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) {
            cart = await prisma_1.prisma.cart.create({ data: { userId: req.user.id } });
        }
        const existingItem = await prisma_1.prisma.cartItem.findFirst({
            where: { cartId: cart.id, productId }
        });
        if (existingItem) {
            // If adding customized item (e.g. Nursery), overwrite customization and quantity
            await prisma_1.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: {
                    quantity: customization ? quantity : existingItem.quantity + quantity,
                    customization: customization || existingItem.customization
                }
            });
        }
        else {
            await prisma_1.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId,
                    quantity,
                    customization: customization || {}
                }
            });
        }
        const updatedCart = await prisma_1.prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });
        res.json({ success: true, message: 'Item added', data: calculateSubtotal(updatedCart) });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/items/:itemId', async (req, res, next) => {
    try {
        const itemId = String(req.params.itemId);
        const schema = zod_1.z.object({ quantity: zod_1.z.number().int().min(0) });
        const { quantity } = schema.parse(req.body);
        const cart = await prisma_1.prisma.cart.findUnique({ where: { userId: req.user.id } });
        if (!cart)
            return res.status(404).json({ success: false, message: 'Cart not found' });
        const item = await prisma_1.prisma.cartItem.findUnique({ where: { id: itemId } });
        if (!item || item.cartId !== cart.id) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
        if (quantity === 0) {
            await prisma_1.prisma.cartItem.delete({ where: { id: itemId } });
        }
        else {
            await prisma_1.prisma.cartItem.update({
                where: { id: itemId },
                data: { quantity }
            });
        }
        const updatedCart = await prisma_1.prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });
        res.json({ success: true, message: 'Item updated', data: calculateSubtotal(updatedCart) });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/items/:itemId', async (req, res, next) => {
    try {
        const itemId = String(req.params.itemId);
        const cart = await prisma_1.prisma.cart.findUnique({ where: { userId: req.user.id } });
        if (!cart)
            return res.status(404).json({ success: false, message: 'Cart not found' });
        const item = await prisma_1.prisma.cartItem.findUnique({ where: { id: itemId } });
        if (!item || item.cartId !== cart.id) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }
        await prisma_1.prisma.cartItem.delete({ where: { id: itemId } });
        const updatedCart = await prisma_1.prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });
        res.json({ success: true, message: 'Item removed', data: calculateSubtotal(updatedCart) });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/', async (req, res, next) => {
    try {
        const cart = await prisma_1.prisma.cart.findUnique({ where: { userId: req.user.id } });
        if (!cart)
            return res.status(404).json({ success: false, message: 'Cart not found' });
        await prisma_1.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        const updatedCart = await prisma_1.prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { product: true } } }
        });
        res.json({ success: true, message: 'Cart cleared', data: calculateSubtotal(updatedCart) });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
