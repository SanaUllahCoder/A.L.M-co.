import { Router } from 'express';
import { z } from 'zod';
import Invoice from '../models/Invoice.js';
import InvoiceCounter from '../models/InvoiceCounter.js';
import Product from '../models/Product.js';
import Shopkeeper from '../models/Shopkeeper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { codeSchema, parseBody } from '../utils/validation.js';

const router = Router();
const createInvoiceSchema = z.object({
  shopkeeperCode: codeSchema,
  invoiceDate: z.coerce.date().optional(),
  products: z.array(z.object({
    productCode: codeSchema,
    quantity: z.coerce.number().int().positive('Quantity must be a positive whole number')
  })).min(1, 'Add at least one product.')
});

router.get('/', asyncHandler(async (req, res) => {
  const { search, from, to } = req.query;
  const filter = {};
  if (search?.trim()) {
    const value = search.trim();
    filter.$or = [
      { invoiceNumber: { $regex: value, $options: 'i' } },
      { 'shopkeeper.code': { $regex: value, $options: 'i' } },
      { 'shopkeeper.name': { $regex: value, $options: 'i' } }
    ];
  }
  if (from || to) {
    filter.invoiceDate = {};
    if (from) filter.invoiceDate.$gte = new Date(`${from}T00:00:00.000Z`);
    if (to) filter.invoiceDate.$lte = new Date(`${to}T23:59:59.999Z`);
  }
  res.json(await Invoice.find(filter).sort({ invoiceDate: -1, createdAt: -1 }).lean());
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = parseBody(createInvoiceSchema, req.body);
  const shopkeeper = await Shopkeeper.findOne({ code: data.shopkeeperCode.toUpperCase() }).lean();
  if (!shopkeeper) return res.status(400).json({ message: 'Enter a valid shopkeeper code.' });

  const codes = data.products.map((line) => line.productCode.toUpperCase());
  const products = await Product.find({ code: { $in: codes } }).lean();
  const productsByCode = new Map(products.map((product) => [product.code, product]));
  const lines = data.products.map((line) => {
    const product = productsByCode.get(line.productCode.toUpperCase());
    if (!product) {
      const error = new Error(`Product code "${line.productCode}" was not found.`);
      error.status = 400;
      throw error;
    }
    const lineTotal = Math.round(line.quantity * product.saleRate * 100) / 100;
    return {
      productCode: product.code,
      productName: product.name,
      quantity: line.quantity,
      unitRate: product.saleRate,
      lineTotal
    };
  });

  const subtotal = Math.round(lines.reduce((sum, line) => sum + line.lineTotal, 0) * 100) / 100;
  const discountPercentage = shopkeeper.discountPercentage;
  const discountAmount = Math.round(subtotal * discountPercentage) / 100;
  const grandTotal = Math.round((subtotal - discountAmount) * 100) / 100;
  const day = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const counter = await InvoiceCounter.findByIdAndUpdate(
    day, { $inc: { sequence: 1 } }, { new: true, upsert: true }
  );
  const invoice = await Invoice.create({
    invoiceNumber: `INV-${day}-${String(counter.sequence).padStart(4, '0')}`,
    invoiceDate: data.invoiceDate ?? new Date(),
    shopkeeper: {
      code: shopkeeper.code,
      name: shopkeeper.name,
      area: shopkeeper.area,
      contactNumber: shopkeeper.contactNumber
    },
    products: lines,
    subtotal,
    discountPercentage,
    discountAmount,
    grandTotal
  });
  return res.status(201).json(invoice);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).lean();
  if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
  return res.json(invoice);
}));

export default router;
