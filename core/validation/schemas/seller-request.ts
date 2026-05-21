import { z } from 'zod';

export const ApproveSellerRequestSchema = z.object({
  reason: z.string().trim().optional(),
});

export const RejectSellerRequestSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Rejection reason must be at least 10 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters')
    .regex(/^[^<>]*$/, 'Special characters like < or > are not allowed for security reasons.'),
});

export type ApproveSellerRequestValues = z.infer<typeof ApproveSellerRequestSchema>;
export type RejectSellerRequestValues = z.infer<typeof RejectSellerRequestSchema>;
