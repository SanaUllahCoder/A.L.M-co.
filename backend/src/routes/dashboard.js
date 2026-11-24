import { Router } from 'express';
import Invoice from '../models/Invoice.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/summary', asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const [totalInvoices, todayInvoices, sales] = await Promise.all([
    Invoice.countDocuments(),
    Invoice.countDocuments({ invoiceDate: { $gte: start } }),
    Invoice.aggregate([{ $group: { _id: null, total: { $sum: '$grandTotal' } } }])
  ]);
  res.json({
    totalInvoices,
    todayInvoices,
    totalSales: sales[0]?.total ?? 0
  });
}));

export default router;
