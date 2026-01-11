import { z } from "zod";

export const updateUserSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional().nullable(),
  
  // [THÊM DÒNG NÀY] Cho phép cập nhật mật khẩu (ít nhất 6 ký tự)
  password: z.string().min(6).optional()
});

export function validateUpdateUser(data) {
  return updateUserSchema.parse(data);
}