import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseBody } from '../utils/validation.js';

const router = Router();
const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = parseBody(loginSchema, req.body);
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return res.status(401).json({ message: 'Incorrect email or password.' });
  }
  const token = jwt.sign(
    { sub: admin.id, name: admin.name, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN ?? '8h' }
  );
  return res.json({ token, admin: { name: admin.name, email: admin.email } });
}));

export default router;
