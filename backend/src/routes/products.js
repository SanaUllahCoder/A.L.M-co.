import { Router } from 'express';
import Product from '../models/Product.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody, productSchema } from '../utils/validation.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const query = req.query.search?.trim();
  const filter = query ? { $or: [
    { code: { $regex: query, $options: 'i' } },
    { name: { $regex: query, $options: 'i' } }
  ] } : {};
  res.json(await Product.find(filter).sort({ name: 1 }).lean());
}));

router.get('/by-code/:code', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ code: req.params.code.toUpperCase() }).lean();
  if (!product) return res.status(404).json({ message: 'Product code not found.' });
  return res.json(product);
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = parseBody(productSchema, req.body);
  res.status(201).json(await Product.create({ ...data, code: data.code.toUpperCase() }));
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const data = parseBody(productSchema, req.body);
  const product = await Product.findByIdAndUpdate(
    req.params.id, { ...data, code: data.code.toUpperCase() }, { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  return res.json(product);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found.' });
  return res.status(204).end();
}));

export default router;
