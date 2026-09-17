"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const p = new client_1.PrismaClient();
async function main() {
    const pw = async (s) => bcryptjs_1.default.hash(s, 12);
    const admin = await p.user.upsert({ where: { email: 'admin@interiorg.local' }, update: {}, create: { email: 'admin@interiorg.local', name: 'InteriorG Admin', passwordHash: await pw('Admin@12345'), role: client_1.Role.ADMIN } });
    const stock = await p.user.upsert({ where: { email: 'stock@interiorg.local' }, update: {}, create: { email: 'stock@interiorg.local', name: 'Stock Manager', passwordHash: await pw('Stock@12345'), role: client_1.Role.STOCK_MANAGER } });
    await p.user.upsert({ where: { email: 'customer@interiorg.local' }, update: {}, create: { email: 'customer@interiorg.local', name: 'Demo Customer', passwordHash: await pw('Customer@12345'), role: client_1.Role.CUSTOMER } });
    await p.user.upsert({ where: { email: 'admin@casacanvas.local' }, update: {}, create: { email: 'admin@casacanvas.local', name: 'InteriorG Admin', passwordHash: await pw('Admin@12345'), role: client_1.Role.ADMIN } });
    await p.user.upsert({ where: { email: 'stock@casacanvas.local' }, update: {}, create: { email: 'stock@casacanvas.local', name: 'Stock Manager', passwordHash: await pw('Stock@12345'), role: client_1.Role.STOCK_MANAGER } });
    await p.user.upsert({ where: { email: 'customer@casacanvas.local' }, update: {}, create: { email: 'customer@casacanvas.local', name: 'Demo Customer', passwordHash: await pw('Customer@12345'), role: client_1.Role.CUSTOMER } });
    const cats = ['Wallpapers', 'Aesthetic Decor', 'Wall Art'];
    for (const n of cats)
        await p.category.upsert({ where: { slug: n.toLowerCase().replace(/ /g, '-') }, update: {}, create: { name: n, slug: n.toLowerCase().replace(/ /g, '-') } });
    const wallpaper = await p.category.findUniqueOrThrow({ where: { slug: 'wallpapers' } });
    const products = [['Marble Vein', 'marble-vein', 'Luxe marble texture for contemporary walls', client_1.ProductType.CUSTOM_WALLPAPER, 'CC-WP-001', 349, 38, 120], ['Sage Botanical', 'sage-botanical', 'Calm botanical pattern with premium matte finish', client_1.ProductType.CUSTOM_WALLPAPER, 'CC-WP-002', 299, 32, 120], ['Minimal Arch Print', 'minimal-arch-print', 'Warm neutral art print for modern spaces', client_1.ProductType.WALL_ART, 'CC-WA-001', 1299, null, null], ['Ceramic Vase Duo', 'ceramic-vase-duo', 'Hand-finished ceramic accent pair', client_1.ProductType.AESTHETIC_DECOR, 'CC-AD-001', 1899, null, null]];
    for (const [name, slug, description, type, sku, price, ppsf, coverage] of products) {
        const x = await p.product.upsert({ where: { sku }, update: {}, create: { name, slug, description, type, sku, price, pricePerSqFt: ppsf, coverageSqFt: coverage, unit: type === client_1.ProductType.CUSTOM_WALLPAPER ? 'sq ft' : 'piece', images: [], isCustomizable: type === client_1.ProductType.CUSTOM_WALLPAPER, categoryId: wallpaper.id } });
        const inv = await p.inventory.upsert({ where: { productId: x.id }, update: {}, create: { productId: x.id, totalQuantity: 100, reorderLevel: 10 } });
        const count = await p.inventoryTransaction.count({ where: { inventoryId: inv.id } });
        if (!count)
            await p.inventoryTransaction.create({ data: { inventoryId: inv.id, quantity: 100, type: client_1.InventoryTxnType.STOCK_IN, previousQuantity: 0, newQuantity: 100, performedBy: stock.id } });
    }
    console.log({ admin: admin.email, stock: stock.email });
}
main().finally(() => p.$disconnect());
