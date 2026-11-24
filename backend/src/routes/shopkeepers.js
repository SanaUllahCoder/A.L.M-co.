import { Router } from 'express';
import Shopkeeper from '../models/Shopkeeper.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody, shopkeeperSchema } from '../utils/validation.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const query = req.query.search?.trim();
  const filter = query ? { $or: [
    { code: { $regex: query, $options: 'i' } },
    { name: { $regex: query, $options: 'i' } }
  ] } : {};
  const shopkeepers = await Shopkeeper.find(filter).sort({ name: 1 }).lean();
  res.json(shopkeepers);
}));

router.get('/by-code/:code', asyncHandler(async (req, res) => {
  const shopkeeper = await Shopkeeper.findOne({ code: req.params.code.toUpperCase() }).lean();
  if (!shopkeeper) return res.status(404).json({ message: 'Shopkeeper code not found.' });
  return res.json(shopkeeper);
}));

router.post('/', asyncHandler(async (req, res) => {
  const data = parseBody(shopkeeperSchema, req.body);
  const shopkeeper = await Shopkeeper.create({ ...data, code: data.code.toUpperCase() });
  res.status(201).json(shopkeeper);
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const data = parseBody(shopkeeperSchema, req.body);
  const shopkeeper = await Shopkeeper.findByIdAndUpdate(
    req.params.id, { ...data, code: data.code.toUpperCase() }, { new: true, runValidators: true }
  );
  if (!shopkeeper) return res.status(404).json({ message: 'Shopkeeper not found.' });
  return res.json(shopkeeper);
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const shopkeeper = await Shopkeeper.findByIdAndDelete(req.params.id);
  if (!shopkeeper) return res.status(404).json({ message: 'Shopkeeper not found.' });
  return res.status(204).end();
}));

export default router;
