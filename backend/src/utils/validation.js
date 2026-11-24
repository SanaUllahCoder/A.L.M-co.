import { z } from 'zod';

export function parseBody(schema, value) {
  const result = schema.safeParse(value);
  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => issue.message).join(', '));
    error.status = 400;
    throw error;
  }
  return result.data;
}

export const codeSchema = z.string().trim().min(1, 'Code is required').max(40);
export const shopkeeperSchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(1, 'Name is required').max(120),
  contactNumber: z.string().trim().max(40).optional().default(''),
  area: z.string().trim().min(1, 'Area / city is required').max(120),
  discountPercentage: z.coerce.number().min(0).max(100)
});
export const productSchema = z.object({
  code: codeSchema,
  name: z.string().trim().min(1, 'Name is required').max(160),
  saleRate: z.coerce.number().positive('Sale rate must be greater than zero')
});
