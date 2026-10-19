"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_1.auth);
router.use((0, auth_1.roles)(client_1.Role.ADMIN));
router.get('/metrics', async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalOrders, activeOrders, customers, products, revenueResult, inventories, recentOrders] = await Promise.all([
            prisma_1.prisma.order.count(),
            prisma_1.prisma.order.count({ where: { status: { not: client_1.OrderStatus.CANCELLED } } }),
            prisma_1.prisma.user.count({ where: { role: client_1.Role.CUSTOMER } }),
            prisma_1.prisma.product.count({ where: { isActive: true } }),
            prisma_1.prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: client_1.OrderStatus.CANCELLED } } }),
            prisma_1.prisma.inventory.findMany(),
            prisma_1.prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        ]);
        const lowStockCount = inventories.filter(inv => {
            const available = inv.totalQuantity - inv.reservedQuantity - inv.damagedQuantity;
            return available <= inv.reorderLevel;
        }).length;
        res.json({
            success: true,
            message: 'Metrics retrieved',
            data: {
                totalOrders,
                activeOrders,
                customers,
                products,
                revenue: revenueResult._sum.total || 0,
                lowStockCount,
                recentOrders
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/users', async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const role = req.query.role;
        const q = req.query.q;
        const where = {};
        if (role && role !== 'ALL')
            where.role = role;
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } }
            ];
        }
        const [users, total] = await Promise.all([
            prisma_1.prisma.user.findMany({
                where, skip, take: limit,
                include: { _count: { select: { orders: true } } }
            }),
            prisma_1.prisma.user.count({ where })
        ]);
        res.json({ success: true, message: 'Users retrieved', data: { users, total, page, limit } });
    }
    catch (error) {
        next(error);
    }
});
// SECURITY: Role modification via API is strictly disabled to prevent privilege escalation
router.patch('/users/:id/role', async (_req, res) => {
    return res.status(403).json({
        success: false,
        message: 'Role modification via admin panel is disabled for security reasons.'
    });
});
router.get('/audit-log', async (req, res, next) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const entityType = req.query.entityType;
        const userId = req.query.userId;
        const where = {};
        if (entityType)
            where.entityType = entityType;
        if (userId)
            where.userId = userId;
        const [logs, total] = await Promise.all([
            prisma_1.prisma.auditLog.findMany({
                where, skip, take: limit,
                include: { user: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.auditLog.count({ where })
        ]);
        res.json({ success: true, message: 'Audit logs retrieved', data: { logs, total, page, limit } });
    }
    catch (error) {
        next(error);
    }
});
router.get('/revenue-chart', async (req, res, next) => {
    try {
        const data = await prisma_1.prisma.$queryRaw `
      SELECT DATE("createdAt") as date, SUM("total") as revenue, COUNT(*) as orders 
      FROM "Order" 
      WHERE "createdAt" > NOW() - INTERVAL '30 days' AND "status" != 'CANCELLED' 
      GROUP BY DATE("createdAt") 
      ORDER BY date
    `;
        res.json({ success: true, message: 'Revenue chart data retrieved', data });
    }
    catch (error) {
        next(error);
    }
});
router.get('/location-analytics', async (req, res, next) => {
    try {
        // Aggregation of orders grouped by State and City
        const orders = await prisma_1.prisma.order.findMany({
            where: { status: { not: client_1.OrderStatus.CANCELLED } },
            select: {
                id: true,
                total: true,
                createdAt: true,
                status: true,
                address: {
                    select: {
                        city: true,
                        state: true,
                        country: true,
                        postalCode: true
                    }
                }
            }
        });
        const stateMap = {};
        const cityMap = {};
        for (const ord of orders) {
            const state = (ord.address?.state || 'Unknown').trim();
            const city = (ord.address?.city || 'Unknown').trim();
            const rev = Number(ord.total) || 0;
            // Group by State
            if (!stateMap[state]) {
                stateMap[state] = { state, orderCount: 0, revenue: 0, cities: {} };
            }
            stateMap[state].orderCount += 1;
            stateMap[state].revenue += rev;
            if (!stateMap[state].cities[city]) {
                stateMap[state].cities[city] = { city, orderCount: 0, revenue: 0 };
            }
            stateMap[state].cities[city].orderCount += 1;
            stateMap[state].cities[city].revenue += rev;
            // Group by City directly
            const cityKey = `${city}, ${state}`;
            if (!cityMap[cityKey]) {
                cityMap[cityKey] = { city, state, orderCount: 0, revenue: 0 };
            }
            cityMap[cityKey].orderCount += 1;
            cityMap[cityKey].revenue += rev;
        }
        const states = Object.values(stateMap)
            .map(s => ({
            ...s,
            revenue: Math.round(s.revenue * 100) / 100,
            cities: Object.values(s.cities).sort((a, b) => b.orderCount - a.orderCount)
        }))
            .sort((a, b) => b.orderCount - a.orderCount);
        const cities = Object.values(cityMap)
            .map(c => ({
            ...c,
            revenue: Math.round(c.revenue * 100) / 100
        }))
            .sort((a, b) => b.orderCount - a.orderCount);
        res.json({
            success: true,
            message: 'Location analytics retrieved',
            data: {
                totalOrdersWithLocation: orders.length,
                states,
                cities
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
