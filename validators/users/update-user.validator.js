import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional().nullable(),
});

export function validateUpdateUser(data) {
  return updateUserSchema.parse(data);
}
