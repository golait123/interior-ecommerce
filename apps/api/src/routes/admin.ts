import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { auth, roles, AuthReq } from '../middleware/auth';
import { Role, OrderStatus } from '@prisma/client';

const router = Router();
router.use(auth);
router.use(roles(Role.ADMIN));

router.get('/metrics', async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalOrders, activeOrders, customers, products, revenueResult, inventories, recentOrders] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { not: OrderStatus.CANCELLED } } }),
      prisma.user.count({ where: { role: Role.CUSTOMER } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: OrderStatus.CANCELLED } } }),
      prisma.inventory.findMany(),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
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
  } catch (error) { next(error); }
});

router.get('/users', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const role = req.query.role as Role;
    const q = req.query.q as string;

    const where: any = {};
    if (role && (role as string) !== 'ALL') where.role = role;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: limit,
        include: { _count: { select: { orders: true } } }
      }),
      prisma.user.count({ where })
    ]);

    res.json({ success: true, message: 'Users retrieved', data: { users, total, page, limit } });
  } catch (error) { next(error); }
});

// SECURITY: Role modification via API is strictly disabled to prevent privilege escalation
router.patch('/users/:id/role', async (_req: AuthReq, res) => {
  return res.status(403).json({ 
    success: false, 
    message: 'Role modification via admin panel is disabled for security reasons.' 
  });
});

router.get('/audit-log', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const entityType = req.query.entityType as string;
    const userId = req.query.userId as string;

    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: limit,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({ success: true, message: 'Audit logs retrieved', data: { logs, total, page, limit } });
  } catch (error) { next(error); }
});

router.get('/revenue-chart', async (req, res, next) => {
  try {
    const data = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, SUM("total") as revenue, COUNT(*) as orders 
      FROM "Order" 
      WHERE "createdAt" > NOW() - INTERVAL '30 days' AND "status" != 'CANCELLED' 
      GROUP BY DATE("createdAt") 
      ORDER BY date
    `;
    res.json({ success: true, message: 'Revenue chart data retrieved', data });
  } catch (error) { next(error); }
});

router.get('/location-analytics', async (req, res, next) => {
  try {
    // Aggregation of orders grouped by State and City
    const orders = await prisma.order.findMany({
      where: { status: { not: OrderStatus.CANCELLED } },
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

    const stateMap: Record<string, { state: string; orderCount: number; revenue: number; cities: Record<string, { city: string; orderCount: number; revenue: number }> }> = {};
    const cityMap: Record<string, { city: string; state: string; orderCount: number; revenue: number }> = {};

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
  } catch (error) { next(error); }
});

export default router;
