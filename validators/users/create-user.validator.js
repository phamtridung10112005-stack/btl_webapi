import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().max(20).optional().nullable(),
  
  // [BẮT BUỘC THÊM 2 DÒNG NÀY]:
  password: z.string().min(6, "Mật khẩu phải ít nhất 6 ký tự"), 
  role: z.string().optional().default('USER') 
});

export function validateCreateUser(data) {
  return createUserSchema.parse(data);
}