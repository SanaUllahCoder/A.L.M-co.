import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/db.js';
import Admin from '../models/Admin.js';
import Product from '../models/Product.js';
import Shopkeeper from '../models/Shopkeeper.js';

await connectDatabase();

const email = process.env.ADMIN_EMAIL?.toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password || password === 'change-me-before-deploying') {
  throw new Error('Set ADMIN_EMAIL and a non-default ADMIN_PASSWORD in backend/.env before seeding.');
}

await Admin.updateOne(
  { email },
  { $setOnInsert: {
    name: process.env.ADMIN_NAME ?? 'Administrator',
    email,
    passwordHash: await bcrypt.hash(password, 12)
  } },
  { upsert: true }
);

if (await Shopkeeper.countDocuments() === 0) {
  await Shopkeeper.insertMany([
    { code: 'SHOP-001', name: 'Sana Beauty Store', area: 'Lahore', discountPercentage: 5 },
    { code: 'SHOP-002', name: 'Glow Cosmetics', area: 'Islamabad', discountPercentage: 8 }
  ]);
}
if (await Product.countDocuments() === 0) {
  await Product.insertMany([
    { code: 'PRD-001', name: 'Hydrating Face Cream', saleRate: 850 },
    { code: 'PRD-002', name: 'Vitamin C Serum', saleRate: 1250 },
    { code: 'PRD-003', name: 'Daily Sunscreen SPF 50', saleRate: 990 }
  ]);
}

console.log(`Admin ready: ${email}. Development sample records are only inserted into empty collections.`);
await (await import('mongoose')).default.disconnect();
