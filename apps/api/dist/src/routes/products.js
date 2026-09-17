"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROOM_MAPPINGS = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
exports.ROOM_MAPPINGS = [
    {
        slug: 'living-room',
        name: 'Living Room',
        icon: '🛋️',
        description: 'Bespoke wallpapers, Sheesham consoles, rattan chandeliers & artisan mirrors',
        matches: (p) => {
            const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''}`.toLowerCase();
            return text.includes('living') || text.includes('console') || text.includes('mirror') || text.includes('rattan') ||
                text.includes('chandelier') || text.includes('wallpaper') || text.includes('floral') || text.includes('botanical') ||
                text.includes('vase') || text.includes('sculpture') || text.includes('stool') || text.includes('marble');
        }
    },
    {
        slug: 'dining',
        name: 'Dining',
        icon: '🍽️',
        description: 'Artisan ceramic bowls, tapas tableware, dining consoles & candelabras',
        matches: (p) => {
            const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''}`.toLowerCase();
            return text.includes('dining') || text.includes('crockery') || text.includes('bowl') || text.includes('tapas') ||
                text.includes('tableware') || text.includes('dish') || text.includes('candelabra') || text.includes('table') ||
                text.includes('pendant') || text.includes('urn') || text.includes('serving');
        }
    },
    {
        slug: 'kitchen',
        name: 'Kitchen',
        icon: '🍳',
        description: 'Handcrafted ceramic serving dishes, speckled glaze sets & bar stools',
        matches: (p) => {
            const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''}`.toLowerCase();
            return text.includes('kitchen') || text.includes('crockery') || text.includes('bowl') || text.includes('tapas') ||
                text.includes('serving') || text.includes('dish') || text.includes('stool') || text.includes('fluted') ||
                text.includes('botanical') || text.includes('counter');
        }
    },
    {
        slug: 'drawing-room',
        name: 'Drawing Room',
        icon: '🪴',
        description: 'Ornate sunburst brass mirrors, heritage Rajasthani murals & antique filigree accents',
        matches: (p) => {
            const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''}`.toLowerCase();
            return text.includes('drawing') || text.includes('sunburst') || text.includes('antique') || text.includes('mirror') ||
                text.includes('arch') || text.includes('jaipuri') || text.includes('heritage') || text.includes('filigree') ||
                text.includes('candelabra') || text.includes('sculpture') || text.includes('console') || text.includes('wall art') ||
                text.includes('minimal arch');
        }
    },
    {
        slug: 'hall',
        name: 'Hall',
        icon: '🚪',
        description: 'Grand foyer mirrors, hallway statement consoles, floor urns & luxury murals',
        matches: (p) => {
            const text = `${p.name} ${p.description} ${p.category?.name || ''} ${p.category?.slug || ''}`.toLowerCase();
            return text.includes('hall') || text.includes('foyer') || text.includes('corridor') || text.includes('entryway') ||
                text.includes('antique brass') || text.includes('mirror') || text.includes('console') || text.includes('marble') ||
                text.includes('filigree') || text.includes('urn') || text.includes('sculpture') || text.includes('arch');
        }
    }
];
router.get('/', async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
        const skip = (page - 1) * limit;
        const q = req.query.q;
        const category = req.query.category;
        const room = req.query.room;
        const type = req.query.type;
        const where = { isActive: true };
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } }
            ];
        }
        if (category) {
            where.category = { slug: category };
        }
        if (type) {
            where.type = type;
        }
        // Fetch products
        let items = await prisma_1.prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { category: true, inventory: true }
        });
        // Map matching rooms to each product
        let enrichedItems = items.map(p => ({
            ...p,
            rooms: exports.ROOM_MAPPINGS.filter(rm => rm.matches(p)).map(rm => rm.name)
        }));
        // Filter by room if specified
        if (room && room !== 'all') {
            const roomDef = exports.ROOM_MAPPINGS.find(r => r.slug === room);
            if (roomDef) {
                enrichedItems = enrichedItems.filter(p => roomDef.matches(p));
            }
        }
        const total = enrichedItems.length;
        const paginatedItems = enrichedItems.slice(skip, skip + limit);
        res.json({
            success: true,
            message: 'Products retrieved',
            data: {
                items: paginatedItems,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/room-categories', async (_req, res, next) => {
    try {
        const allProducts = await prisma_1.prisma.product.findMany({
            where: { isActive: true },
            include: { category: true }
        });
        const roomCategories = [
            {
                slug: '',
                name: 'All Collection',
                icon: '✨',
                description: 'Explore full catalog across all rooms',
                count: allProducts.length
            },
            ...exports.ROOM_MAPPINGS.map(rm => ({
                slug: rm.slug,
                name: rm.name,
                icon: rm.icon,
                description: rm.description,
                count: allProducts.filter(p => rm.matches(p)).length
            }))
        ];
        res.json({
            success: true,
            message: 'Room categories retrieved',
            data: roomCategories
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/categories', async (req, res, next) => {
    try {
        const categories = await prisma_1.prisma.category.findMany({
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });
        res.json({ success: true, message: 'Categories retrieved', data: categories });
    }
    catch (error) {
        next(error);
    }
});
router.get('/:id', async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const product = await prisma_1.prisma.product.findFirst({
            where: { OR: [{ id }, { slug: id }] },
            include: { category: true, inventory: true }
        });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product retrieved', data: product });
    }
    catch (error) {
        next(error);
    }
});
router.post('/', auth_1.auth, (0, auth_1.roles)(client_1.Role.ADMIN), async (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            name: zod_1.z.string().min(2),
            slug: zod_1.z.string().optional(),
            description: zod_1.z.string(),
            type: zod_1.z.nativeEnum(client_1.ProductType),
            sku: zod_1.z.string().optional(),
            price: zod_1.z.number().positive(),
            discountPrice: zod_1.z.number().positive().optional(),
            categoryId: zod_1.z.string(),
            unit: zod_1.z.string().optional(),
            pricePerSqFt: zod_1.z.number().optional(),
            coverageSqFt: zod_1.z.number().optional(),
            isCustomizable: zod_1.z.boolean().optional(),
            material: zod_1.z.string().optional(),
            finish: zod_1.z.string().optional(),
            images: zod_1.z.array(zod_1.z.string()).optional(),
            initialStock: zod_1.z.number().int().min(0).optional(),
        });
        const parsed = schema.parse(req.body);
        const { initialStock, ...productData } = parsed;
        const baseSlug = (productData.slug || productData.name)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        const slug = productData.slug || `${baseSlug}-${Date.now().toString().slice(-4)}`;
        const sku = productData.sku || `IG-${Date.now().toString().slice(-6)}`;
        const product = await prisma_1.prisma.$transaction(async (tx) => {
            const p = await tx.product.create({
                data: {
                    ...productData,
                    slug,
                    sku,
                    images: productData.images || [],
                    unit: productData.unit || (productData.type === client_1.ProductType.CUSTOM_WALLPAPER ? 'sq ft' : 'piece'),
                    isCustomizable: productData.isCustomizable ?? (productData.type === client_1.ProductType.CUSTOM_WALLPAPER),
                }
            });
            const inv = await tx.inventory.create({
                data: {
                    productId: p.id,
                    totalQuantity: initialStock || 0,
                    reservedQuantity: 0,
                    damagedQuantity: 0,
                    reorderLevel: 10,
                    warehouseLocation: 'Main Warehouse',
                    unit: p.unit
                }
            });
            if (initialStock && initialStock > 0) {
                await tx.inventoryTransaction.create({
                    data: {
                        inventoryId: inv.id,
                        type: 'STOCK_IN',
                        quantity: initialStock,
                        previousQuantity: 0,
                        newQuantity: initialStock,
                        performedBy: req.user.id,
                        referenceId: 'Initial product stock'
                    }
                });
            }
            return p;
        });
        res.json({ success: true, message: 'Product created', data: product });
    }
    catch (error) {
        next(error);
    }
});
router.put('/:id', auth_1.auth, (0, auth_1.roles)(client_1.Role.ADMIN), async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const schema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            slug: zod_1.z.string().optional(),
            description: zod_1.z.string().optional(),
            type: zod_1.z.nativeEnum(client_1.ProductType).optional(),
            sku: zod_1.z.string().optional(),
            price: zod_1.z.number().positive().optional(),
            categoryId: zod_1.z.string().optional(),
            unit: zod_1.z.string().optional(),
            pricePerSqFt: zod_1.z.number().optional(),
            isCustomizable: zod_1.z.boolean().optional(),
            material: zod_1.z.string().optional(),
            finish: zod_1.z.string().optional(),
        });
        const data = schema.parse(req.body);
        const product = await prisma_1.prisma.product.update({
            where: { id },
            data
        });
        res.json({ success: true, message: 'Product updated', data: product });
    }
    catch (error) {
        next(error);
    }
});
router.patch('/:id/status', auth_1.auth, (0, auth_1.roles)(client_1.Role.ADMIN), async (req, res, next) => {
    try {
        const id = String(req.params.id);
        const product = await prisma_1.prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        const updated = await prisma_1.prisma.product.update({
            where: { id },
            data: { isActive: !product.isActive }
        });
        res.json({ success: true, message: 'Product status updated', data: updated });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
