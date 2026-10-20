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
router.get('/financial-analytics', async (req, res, next) => {
    try {
        const targetYear = parseInt(req.query.year) || new Date().getFullYear();
        const orders = await prisma_1.prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: {
                            include: { category: true }
                        }
                    }
                },
                payment: true,
                user: {
                    select: { id: true, name: true, email: true }
                },
                address: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const totalCustomers = await prisma_1.prisma.user.count({ where: { role: client_1.Role.CUSTOMER } });
        // Filter valid (non-cancelled) orders and cancelled orders
        const validOrders = orders.filter(o => o.status !== client_1.OrderStatus.CANCELLED);
        const cancelledOrders = orders.filter(o => o.status === client_1.OrderStatus.CANCELLED);
        // Summary calculations
        const totalGrossRevenue = validOrders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
        const totalNetRevenue = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const totalTaxCollected = validOrders.reduce((sum, o) => sum + Number(o.tax || 0), 0);
        const totalDiscounts = validOrders.reduce((sum, o) => sum + Number(o.discount || 0), 0);
        const totalDeliveryFees = validOrders.reduce((sum, o) => sum + Number(o.delivery || 0), 0);
        const cancelledRevenueLost = cancelledOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const averageOrderValue = validOrders.length > 0 ? Math.round(totalNetRevenue / validOrders.length) : 0;
        const averageRevenuePerCustomer = totalCustomers > 0 ? Math.round(totalNetRevenue / totalCustomers) : 0;
        // Daily average revenue for active days
        const uniqueDates = new Set(validOrders.map(o => o.createdAt.toISOString().slice(0, 10)));
        const activeDaysCount = Math.max(1, uniqueDates.size);
        const dailyAverageRevenue = Math.round(totalNetRevenue / activeDaysCount);
        // Annual Breakdown
        const annualMap = {};
        for (const o of validOrders) {
            const yr = o.createdAt.getFullYear();
            if (!annualMap[yr]) {
                annualMap[yr] = { year: yr, revenue: 0, grossSales: 0, tax: 0, discounts: 0, orders: 0, aov: 0 };
            }
            annualMap[yr].revenue += Number(o.total || 0);
            annualMap[yr].grossSales += Number(o.subtotal || 0);
            annualMap[yr].tax += Number(o.tax || 0);
            annualMap[yr].discounts += Number(o.discount || 0);
            annualMap[yr].orders += 1;
        }
        const annual = Object.values(annualMap).map(a => ({
            ...a,
            revenue: Math.round(a.revenue),
            grossSales: Math.round(a.grossSales),
            tax: Math.round(a.tax),
            aov: a.orders > 0 ? Math.round(a.revenue / a.orders) : 0
        })).sort((a, b) => b.year - a.year);
        // Quarterly Breakdown for targetYear
        const quarters = [
            { quarter: 'Q1 (Jan - Mar)', quarterNum: 1, months: [0, 1, 2] },
            { quarter: 'Q2 (Apr - Jun)', quarterNum: 2, months: [3, 4, 5] },
            { quarter: 'Q3 (Jul - Sep)', quarterNum: 3, months: [6, 7, 8] },
            { quarter: 'Q4 (Oct - Dec)', quarterNum: 4, months: [9, 10, 11] },
        ];
        const quarterly = quarters.map(q => {
            const qOrders = validOrders.filter(o => o.createdAt.getFullYear() === targetYear && q.months.includes(o.createdAt.getMonth()));
            const rev = qOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
            const tax = qOrders.reduce((sum, o) => sum + Number(o.tax || 0), 0);
            const gross = qOrders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
            return {
                quarter: q.quarter,
                quarterNum: q.quarterNum,
                year: targetYear,
                revenue: Math.round(rev),
                grossSales: Math.round(gross),
                tax: Math.round(tax),
                orders: qOrders.length,
                aov: qOrders.length > 0 ? Math.round(rev / qOrders.length) : 0,
                sharePercent: totalNetRevenue > 0 ? Math.round((rev / totalNetRevenue) * 100) : 0
            };
        });
        // Monthly Breakdown for targetYear (12 months)
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const monthly = monthNames.map((name, idx) => {
            const mOrders = validOrders.filter(o => o.createdAt.getFullYear() === targetYear && o.createdAt.getMonth() === idx);
            const rev = mOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
            const gross = mOrders.reduce((sum, o) => sum + Number(o.subtotal || 0), 0);
            const tax = mOrders.reduce((sum, o) => sum + Number(o.tax || 0), 0);
            const disc = mOrders.reduce((sum, o) => sum + Number(o.discount || 0), 0);
            return {
                month: name,
                monthShort: name.slice(0, 3),
                monthNum: idx + 1,
                monthKey: `${targetYear}-${String(idx + 1).padStart(2, '0')}`,
                year: targetYear,
                revenue: Math.round(rev),
                grossSales: Math.round(gross),
                tax: Math.round(tax),
                discounts: Math.round(disc),
                orders: mOrders.length,
                aov: mOrders.length > 0 ? Math.round(rev / mOrders.length) : 0
            };
        });
        // Category revenue breakdown
        const categoryRevenueMap = {};
        for (const o of validOrders) {
            for (const item of o.items) {
                const catName = item.product?.category?.name || 'Curated Decor';
                if (!categoryRevenueMap[catName]) {
                    categoryRevenueMap[catName] = { category: catName, revenue: 0, itemsSold: 0, ordersCount: 0 };
                }
                const itemTotal = Number(item.unitPrice || 0) * (item.quantity || 1);
                categoryRevenueMap[catName].revenue += itemTotal;
                categoryRevenueMap[catName].itemsSold += (item.quantity || 1);
                categoryRevenueMap[catName].ordersCount += 1;
            }
        }
        const categoryBreakdown = Object.values(categoryRevenueMap).map(c => ({
            ...c,
            revenue: Math.round(c.revenue),
            percentage: totalNetRevenue > 0 ? Math.round((c.revenue / totalNetRevenue) * 100) : 0
        })).sort((a, b) => b.revenue - a.revenue);
        // Recent 20 financial transactions ledger
        const recentFinancialTransactions = orders.slice(0, 20).map(o => ({
            id: o.id,
            orderNumber: o.orderNumber,
            date: o.createdAt.toISOString(),
            customerName: o.user?.name || 'Guest Collector',
            customerEmail: o.user?.email || 'N/A',
            itemsCount: o.items.reduce((s, it) => s + it.quantity, 0),
            subtotal: Math.round(Number(o.subtotal || 0)),
            tax: Math.round(Number(o.tax || 0)),
            discount: Math.round(Number(o.discount || 0)),
            delivery: Math.round(Number(o.delivery || 0)),
            total: Math.round(Number(o.total || 0)),
            status: o.status,
            paymentStatus: o.payment?.status || (o.status === client_1.OrderStatus.CANCELLED ? 'REFUNDED' : 'PAID'),
            paymentProvider: o.payment?.provider || 'Razorpay Mock'
        }));
        res.json({
            success: true,
            message: 'Financial analytics retrieved',
            data: {
                summary: {
                    totalGrossRevenue: Math.round(totalGrossRevenue),
                    totalNetRevenue: Math.round(totalNetRevenue),
                    totalTaxCollected: Math.round(totalTaxCollected),
                    totalDiscounts: Math.round(totalDiscounts),
                    totalDeliveryFees: Math.round(totalDeliveryFees),
                    totalOrdersCount: validOrders.length,
                    allOrdersCount: orders.length,
                    cancelledOrdersCount: cancelledOrders.length,
                    cancelledRevenueLost: Math.round(cancelledRevenueLost),
                    averageOrderValue,
                    averageRevenuePerCustomer,
                    dailyAverageRevenue,
                    targetYear
                },
                annual,
                quarterly,
                monthly,
                categoryBreakdown,
                recentFinancialTransactions
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/financial-report/csv', async (req, res, next) => {
    try {
        const targetYear = parseInt(req.query.year) || new Date().getFullYear();
        const orders = await prisma_1.prisma.order.findMany({
            include: {
                items: { include: { product: { include: { category: true } } } },
                payment: true,
                user: { select: { name: true, email: true } },
                address: true
            },
            orderBy: { createdAt: 'desc' }
        });
        const validOrders = orders.filter(o => o.status !== client_1.OrderStatus.CANCELLED);
        const totalGross = validOrders.reduce((s, o) => s + Number(o.subtotal || 0), 0);
        const totalNet = validOrders.reduce((s, o) => s + Number(o.total || 0), 0);
        const totalTax = validOrders.reduce((s, o) => s + Number(o.tax || 0), 0);
        const totalDisc = validOrders.reduce((s, o) => s + Number(o.discount || 0), 0);
        const aov = validOrders.length > 0 ? Math.round(totalNet / validOrders.length) : 0;
        let csv = '';
        csv += `INTERIORG FINANCIAL REVENUE & PERFORMANCE REPORT\n`;
        csv += `Generated At,"${new Date().toISOString()}"\n`;
        csv += `Currency,"INR (Rs.)"\n`;
        csv += `Target Year,"${targetYear}"\n\n`;
        csv += `EXECUTIVE FINANCIAL SUMMARY\n`;
        csv += `Metric,Value\n`;
        csv += `Total Net Revenue,"Rs. ${Math.round(totalNet).toLocaleString()}"\n`;
        csv += `Total Gross Sales,"Rs. ${Math.round(totalGross).toLocaleString()}"\n`;
        csv += `Total GST (18%) Collected,"Rs. ${Math.round(totalTax).toLocaleString()}"\n`;
        csv += `Total Discounts Offered,"Rs. ${Math.round(totalDisc).toLocaleString()}"\n`;
        csv += `Average Order Value (AOV),"Rs. ${aov.toLocaleString()}"\n`;
        csv += `Valid Orders Count,"${validOrders.length}"\n`;
        csv += `Total Orders Placed,"${orders.length}"\n\n`;
        csv += `MONTHLY REVENUE BREAKDOWN (${targetYear})\n`;
        csv += `Month,Year,Orders Count,Gross Sales (INR),GST Tax 18% (INR),Discounts (INR),Net Revenue (INR),Average Order Value (INR)\n`;
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        for (let idx = 0; idx < 12; idx++) {
            const mOrders = validOrders.filter(o => o.createdAt.getFullYear() === targetYear && o.createdAt.getMonth() === idx);
            const rev = mOrders.reduce((s, o) => s + Number(o.total || 0), 0);
            const gross = mOrders.reduce((s, o) => s + Number(o.subtotal || 0), 0);
            const tax = mOrders.reduce((s, o) => s + Number(o.tax || 0), 0);
            const disc = mOrders.reduce((s, o) => s + Number(o.discount || 0), 0);
            const mAov = mOrders.length > 0 ? Math.round(rev / mOrders.length) : 0;
            csv += `"${monthNames[idx]}",${targetYear},${mOrders.length},${Math.round(gross)},${Math.round(tax)},${Math.round(disc)},${Math.round(rev)},${mAov}\n`;
        }
        csv += `\n`;
        csv += `DETAILED FINANCIAL TRANSACTIONS LEDGER\n`;
        csv += `Order Number,Date,Customer Name,Customer Email,Items Qty,Subtotal (INR),GST Tax (INR),Discount (INR),Total (INR),Order Status,Payment Status\n`;
        for (const o of orders) {
            const itemsQty = o.items.reduce((s, it) => s + it.quantity, 0);
            const dateStr = o.createdAt.toISOString().slice(0, 10);
            const custName = (o.user?.name || 'Guest Collector').replace(/"/g, '""');
            const custEmail = (o.user?.email || '').replace(/"/g, '""');
            csv += `"${o.orderNumber}","${dateStr}","${custName}","${custEmail}",${itemsQty},${Math.round(Number(o.subtotal))},${Math.round(Number(o.tax))},${Math.round(Number(o.discount))},${Math.round(Number(o.total))},"${o.status}","${o.payment?.status || 'PAID'}"\n`;
        }
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="InteriorG_Financial_Report_${targetYear}.csv"`);
        res.status(200).send(csv);
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
