import { Router } from 'express';
import { z } from 'zod';

const router = Router();

router.post('/calculate', (req, res, next) => {
  try {
    const schema = z.object({
      width: z.number().positive(),
      height: z.number().positive(),
      walls: z.number().positive().optional().default(1),
      unit: z.enum(['cm', 'inch', 'ft']).optional().default('ft'),
      pricePerSqFt: z.number().positive(),
      wastagePercent: z.number().min(0).optional().default(10),
      installation: z.number().min(0).optional().default(0),
      designCharge: z.number().min(0).optional().default(0),
      delivery: z.number().min(0).optional().default(0),
      taxPercent: z.number().min(0).optional().default(18),
    });

    const data = schema.parse(req.body);

    let multiplier = 1;
    if (data.unit === 'cm') multiplier = 0.00107639;
    if (data.unit === 'inch') multiplier = 0.00694444;

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
  } catch (error) { next(error); }
});

export default router;
