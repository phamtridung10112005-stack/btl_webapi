import { z } from "zod";

export const createUserSchema = z.object({
  id: z.number({ required_error: "ID is required" }),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().max(20).optional().nullable(),
});

export function validateCreateUser(data) {
  return createUserSchema.parse(data);
}
