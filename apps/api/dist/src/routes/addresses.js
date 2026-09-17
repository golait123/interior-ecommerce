"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.use((0, auth_1.roles)(client_1.Role.CUSTOMER));
router.get('/', async (req, res, next) => {
    try {
        const addresses = await prisma_1.prisma.address.findMany({ where: { userId: req.user.id } });
        res.json({ success: true, message: 'Addresses retrieved', data: addresses });
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            line1: zod_1.z.string(),
            line2: zod_1.z.string().optional(),
            city: zod_1.z.string(),
            state: zod_1.z.string(),
            postalCode: zod_1.z.string(),
            country: zod_1.z.string().optional()
        });
        const data = schema.parse(req.body);
        const address = await prisma_1.prisma.address.create({
            data: { ...data, userId: req.user.id }
        });
        res.json({ success: true, message: 'Address created', data: address });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const address = await prisma_1.prisma.address.findUnique({ where: { id } });
        if (!address || address.userId !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        const schema = zod_1.z.object({
            line1: zod_1.z.string().optional(),
            line2: zod_1.z.string().optional(),
            city: zod_1.z.string().optional(),
            state: zod_1.z.string().optional(),
            postalCode: zod_1.z.string().optional(),
            country: zod_1.z.string().optional()
        });
        const data = schema.parse(req.body);
        const updated = await prisma_1.prisma.address.update({
            where: { id },
            data
        });
        res.json({ success: true, message: 'Address updated', data: updated });
    }
    catch (error) {
        next(error);
    }
});
router.delete('/:id', async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const address = await prisma_1.prisma.address.findUnique({ where: { id } });
        if (!address || address.userId !== req.user.id) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }
        await prisma_1.prisma.address.delete({ where: { id } });
        res.json({ success: true, message: 'Address deleted' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
