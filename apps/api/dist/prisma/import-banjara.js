"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function importBanjaraMarketCollection() {
    console.log('--- Importing Banjara Market Gurugram Collection ---');
    // Define categorized products with image arrays from the website
    const banjaraCategoriesWithProducts = [
        {
            categoryName: 'Mirrors & Wall Decor',
            categorySlug: 'mirrors-wall-decor',
            products: [
                {
                    name: 'Handcrafted Antique Brass Round Mirror',
                    slug: 'handcrafted-antique-brass-round-mirror',
                    description: 'Statement handcrafted round mirror with vintage brass floral rim from Sector 58 Banjara Market. Perfect for entryway accents and living room wall decor.',
                    type: client_1.ProductType.HOME_DECOR,
                    sku: 'BMG-MIR-001',
                    price: 1850,
                    unit: 'piece',
                    material: 'Cast Iron / Brass Finish',
                    finish: 'Vintage Antique Gold',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.25_f91b2dcc.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.25_3066c90b.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.25_6e0a8077.jpg'
                    ]
                },
                {
                    name: 'Ornate Sunburst Artisan Wall Mirror',
                    slug: 'ornate-sunburst-artisan-wall-mirror',
                    description: 'Bohemian artisan sunburst carved wall mirror crafted by traditional Rajasthan metalworkers.',
                    type: client_1.ProductType.AESTHETIC_DECOR,
                    sku: 'BMG-MIR-002',
                    price: 2400,
                    unit: 'piece',
                    material: 'Forged Metal',
                    finish: 'Distressed Bronze',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.26_5a572678.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.28_130eda1f.jpg'
                    ]
                }
            ]
        },
        {
            categoryName: 'Artisan Ceramic Vases',
            categorySlug: 'artisan-ceramic-vases',
            products: [
                {
                    name: 'Rustic Terracotta & Glazed Ceramic Urn Vase',
                    slug: 'rustic-terracotta-glazed-ceramic-urn-vase',
                    description: 'Hand-thrown earthen clay vase with dual-tone ceramic glaze, ideal for pampas grass and dry flora arrangements.',
                    type: client_1.ProductType.AESTHETIC_DECOR,
                    sku: 'BMG-VAS-001',
                    price: 950,
                    unit: 'piece',
                    material: 'Stoneware Ceramic',
                    finish: 'Dual Matte Sand / Ochre Glaze',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.13_91c47072.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.14_d1db4612.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.13_eedc4f7a.jpg'
                    ]
                },
                {
                    name: 'Fluted Ceramic Pastel Bloom Vase',
                    slug: 'fluted-ceramic-pastel-bloom-vase',
                    description: 'Contemporary fluted ribbed ceramic vase with a smooth minimalist texture, beloved for Scandinavian and Japandi interior aesthetics.',
                    type: client_1.ProductType.AESTHETIC_DECOR,
                    sku: 'BMG-VAS-002',
                    price: 780,
                    unit: 'piece',
                    material: 'Fine Ceramic',
                    finish: 'Matte Cream Pearl',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.14_1b0e5ba7.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.16_6cf70f65.jpg'
                    ]
                }
            ]
        },
        {
            categoryName: 'Handcrafted Wooden Furniture',
            categorySlug: 'handcrafted-wooden-furniture',
            products: [
                {
                    name: 'Solid Sheesham Wood Carved Console Table',
                    slug: 'solid-sheesham-wood-carved-console-table',
                    description: 'Handcrafted solid Indian rosewood foyer console table with Mughal-inspired hand-carved fretwork pillars.',
                    type: client_1.ProductType.HOME_DECOR,
                    sku: 'BMG-FUR-001',
                    price: 6499,
                    unit: 'piece',
                    material: 'Solid Sheesham Wood',
                    finish: 'Natural Teak Honey Wax',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.48_2a41ea6c-1.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.49_0ed3adcb-1.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.47_881ed8f6-1.jpg'
                    ]
                },
                {
                    name: 'Distressed Vintage Mango Wood Coffee Stool',
                    slug: 'distressed-vintage-mango-wood-coffee-stool',
                    description: 'Versatile bedside wooden accent stool or low coffee seating made from reclaimed mango wood with rustic distressing.',
                    type: client_1.ProductType.HOME_DECOR,
                    sku: 'BMG-FUR-002',
                    price: 2199,
                    unit: 'piece',
                    material: 'Seasoned Mango Wood',
                    finish: 'Rustic Distressed Whitewash',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.50_d3b337ab-1.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.49_97d67ae2-1.jpg'
                    ]
                }
            ]
        },
        {
            categoryName: 'Handmade Crockery & Tableware',
            categorySlug: 'handmade-crockery-tableware',
            products: [
                {
                    name: 'Artisan Speckled Ceramic Pasta & Salad Bowl Set',
                    slug: 'artisan-speckled-ceramic-pasta-salad-bowl-set',
                    description: 'Lead-free, microwave & dishwasher safe artisanal speckled glazed serving platters and shallow dinner bowls.',
                    type: client_1.ProductType.AESTHETIC_DECOR,
                    sku: 'BMG-CRK-001',
                    price: 1250,
                    unit: 'set of 4',
                    material: 'High-fire Clay Pottery',
                    finish: 'Hand-dipped Speckled Reactive Glaze',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.08_5fa919f2.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.10_6a03a76f-1.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.08_b9b6b762.jpg'
                    ]
                },
                {
                    name: 'Handcrafted Ceramic Tapas Plates & Dipping Set',
                    slug: 'handcrafted-ceramic-tapas-plates-dipping-set',
                    description: 'Earthy handmade tapas snack plates and dip holders made in local Khurja & Gurugram artisan pottery kilns.',
                    type: client_1.ProductType.AESTHETIC_DECOR,
                    sku: 'BMG-CRK-002',
                    price: 890,
                    unit: 'set of 6',
                    material: 'High-Density Stoneware',
                    finish: 'Matte Earth Olive',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.04_3ae9db16.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.04_d287e120.jpg'
                    ]
                }
            ]
        },
        {
            categoryName: 'Artistic Lighting & Chandeliers',
            categorySlug: 'artistic-lighting-chandeliers',
            products: [
                {
                    name: 'Boho Woven Rattan & Macrame Pendant Chandelier',
                    slug: 'boho-woven-rattan-macrame-pendant-chandelier',
                    description: 'Intricately hand-woven natural cane and rope pendant lighting fixture casting warm textured geometric shadows across your walls.',
                    type: client_1.ProductType.HOME_DECOR,
                    sku: 'BMG-LGT-001',
                    price: 2850,
                    unit: 'piece',
                    material: 'Natural Rattan Cane & Iron Frame',
                    finish: 'Warm Natural Bamboo',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.16_cebe4810.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.13_ce128e99.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.13_15c17be8.jpg'
                    ]
                },
                {
                    name: 'Handcrafted Moroccan Filigree Table Lamp',
                    slug: 'handcrafted-moroccan-filigree-table-lamp',
                    description: 'Perforated brass filigree ambient lamp casting dreamy warm illumination for nightstands and study tables.',
                    type: client_1.ProductType.AESTHETIC_DECOR,
                    sku: 'BMG-LGT-002',
                    price: 1650,
                    unit: 'piece',
                    material: 'Pierced Sheet Brass',
                    finish: 'Antiqued Moroccan Gold',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.14_a355a987.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.13_da3c6ae2.jpg'
                    ]
                }
            ]
        },
        {
            categoryName: 'Candle Stands & Showpieces',
            categorySlug: 'candle-stands-showpieces',
            products: [
                {
                    name: 'Wrought Iron Triple Tier Candelabra Stand',
                    slug: 'wrought-iron-triple-tier-candelabra-stand',
                    description: 'Dramatic black matte wrought iron candelabra for dining table centerpieces and festive Diwali / Christmas hosting.',
                    type: client_1.ProductType.AESTHETIC_DECOR,
                    sku: 'BMG-CS-001',
                    price: 1100,
                    unit: 'piece',
                    material: 'Hand-hammered Wrought Iron',
                    finish: 'Matte Charcoal Black',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.08_93fea15a.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.09_1a8a16df.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.10_c5568657.jpg'
                    ]
                },
                {
                    name: 'Abstract Metal Figurine Sculpture Showpiece',
                    slug: 'abstract-metal-figurine-sculpture-showpiece',
                    description: 'Contemporary cast brass human silhouette sculpture depicting balance and meditation, mounted on natural marble base.',
                    type: client_1.ProductType.AESTHETIC_DECOR,
                    sku: 'BMG-SHW-001',
                    price: 1450,
                    unit: 'piece',
                    material: 'Cast Brass on White Marble',
                    finish: 'Burnished Gold',
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.06_95bcd72d.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.08.06_4c36ce0c.jpg'
                    ]
                }
            ]
        },
        {
            categoryName: 'Wallpapers & Wall Art',
            categorySlug: 'wallpapers',
            products: [
                {
                    name: 'Banjara Heritage Jaipuri Floral Wallpaper',
                    slug: 'banjara-heritage-jaipuri-floral-wallpaper',
                    description: 'Customizable mural wallpaper featuring traditional block-print flora and motifs from nomadic Rajasthani heritage.',
                    type: client_1.ProductType.CUSTOM_WALLPAPER,
                    sku: 'BMG-WP-001',
                    price: 349,
                    pricePerSqFt: 38,
                    coverageSqFt: 120,
                    unit: 'sq ft',
                    material: 'Non-Woven Vinyl-Coated Canvas',
                    finish: 'Textured Linen Matte',
                    isCustomizable: true,
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.02_f3fa2aa6.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.44_603dcaa0.jpg'
                    ]
                },
                {
                    name: 'Earthy Bohemian Terracotta Arch Wallpaper',
                    slug: 'earthy-bohemian-terracotta-arch-wallpaper',
                    description: 'Warm terracotta, clay and sandstone geometric arches tailored to give warm depth and height to living rooms.',
                    type: client_1.ProductType.CUSTOM_WALLPAPER,
                    sku: 'BMG-WP-002',
                    price: 380,
                    pricePerSqFt: 42,
                    coverageSqFt: 120,
                    unit: 'sq ft',
                    material: 'Eco-Friendly Peel & Stick / Pre-pasted Canvas',
                    finish: 'Ultra Matte Soft Finish',
                    isCustomizable: true,
                    images: [
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.45_e1be9ecf.jpg',
                        'https://banjaramarketsgurugram.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-12-08-at-17.07.45_5397e8fe.jpg'
                    ]
                }
            ]
        }
    ];
    // Retrieve stock manager user for inventory transaction attribution
    const stockUser = await prisma.user.findFirst({
        where: { role: client_1.Role.STOCK_MANAGER }
    });
    const performedById = stockUser?.id || (await prisma.user.findFirst())?.id;
    let totalProductsAdded = 0;
    for (const catGroup of banjaraCategoriesWithProducts) {
        // Upsert Category
        const category = await prisma.category.upsert({
            where: { slug: catGroup.categorySlug },
            update: { name: catGroup.categoryName },
            create: { name: catGroup.categoryName, slug: catGroup.categorySlug }
        });
        console.log(`✓ Category: ${category.name}`);
        for (const prodData of catGroup.products) {
            const product = await prisma.product.upsert({
                where: { sku: prodData.sku },
                update: {
                    name: prodData.name,
                    slug: prodData.slug,
                    description: prodData.description,
                    type: prodData.type,
                    price: prodData.price,
                    unit: prodData.unit,
                    pricePerSqFt: prodData.pricePerSqFt || null,
                    coverageSqFt: prodData.coverageSqFt || null,
                    material: prodData.material,
                    finish: prodData.finish,
                    images: prodData.images,
                    isCustomizable: prodData.isCustomizable || false,
                    categoryId: category.id,
                    isActive: true
                },
                create: {
                    name: prodData.name,
                    slug: prodData.slug,
                    description: prodData.description,
                    type: prodData.type,
                    sku: prodData.sku,
                    price: prodData.price,
                    unit: prodData.unit,
                    pricePerSqFt: prodData.pricePerSqFt || null,
                    coverageSqFt: prodData.coverageSqFt || null,
                    material: prodData.material,
                    finish: prodData.finish,
                    images: prodData.images,
                    isCustomizable: prodData.isCustomizable || false,
                    categoryId: category.id,
                    isActive: true
                }
            });
            // Ensure Inventory is setup with stock units
            const inv = await prisma.inventory.upsert({
                where: { productId: product.id },
                update: { totalQuantity: 75, reorderLevel: 10 },
                create: {
                    productId: product.id,
                    totalQuantity: 75,
                    reservedQuantity: 0,
                    damagedQuantity: 0,
                    reorderLevel: 10,
                    warehouseLocation: 'Gurugram Sector 58 Depot'
                }
            });
            if (performedById) {
                const txnCount = await prisma.inventoryTransaction.count({
                    where: { inventoryId: inv.id }
                });
                if (!txnCount) {
                    await prisma.inventoryTransaction.create({
                        data: {
                            inventoryId: inv.id,
                            quantity: 75,
                            type: client_1.InventoryTxnType.STOCK_IN,
                            previousQuantity: 0,
                            newQuantity: 75,
                            performedBy: performedById,
                            referenceId: 'Banjara Market Batch Import'
                        }
                    });
                }
            }
            totalProductsAdded++;
            console.log(`  + Product: ${product.name} [SKU: ${product.sku}] with ${prodData.images.length} images`);
        }
    }
    console.log(`\nSuccessfully imported ${totalProductsAdded} Banjara Market products across ${banjaraCategoriesWithProducts.length} curated categories!`);
}
importBanjaraMarketCollection()
    .catch((e) => {
    console.error('Error importing collection:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
