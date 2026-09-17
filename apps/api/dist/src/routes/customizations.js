"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.post('/calculate', (req, res, next) => {
    try {
        const schema = zod_1.z.object({
            width: zod_1.z.number().positive(),
            height: zod_1.z.number().positive(),
            walls: zod_1.z.number().positive().optional().default(1),
            unit: zod_1.z.enum(['cm', 'inch', 'ft']).optional().default('ft'),
            pricePerSqFt: zod_1.z.number().positive(),
            wastagePercent: zod_1.z.number().min(0).optional().default(10),
            installation: zod_1.z.number().min(0).optional().default(0),
            designCharge: zod_1.z.number().min(0).optional().default(0),
            delivery: zod_1.z.number().min(0).optional().default(0),
            taxPercent: zod_1.z.number().min(0).optional().default(18),
        });
        const data = schema.parse(req.body);
        let multiplier = 1;
        if (data.unit === 'cm')
            multiplier = 0.00107639;
        if (data.unit === 'inch')
            multiplier = 0.00694444;
        const areaSqFt = data.width * data.height * data.walls * multiplier;
        const billableSqFt = areaSqFt * (1 + data.wastagePercent / 100);
        const material = billableSqFt * data.pricePerSqFt;
        const subtotal = material + data.installation + data.designCharge + data.delivery;
        const tax = subtotal * (data.taxPercent / 100);
        const total = subtotal + tax;
        res.json({
            success: true,
            message: 'Calculated successfully',
            data: {
                areaSqFt,
                billableSqFt,
                material,
                installation: data.installation,
                designCharge: data.designCharge,
                delivery: data.delivery,
                subtotal,
                tax,
                total
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
