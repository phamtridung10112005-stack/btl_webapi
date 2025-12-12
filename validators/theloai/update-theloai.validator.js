// File: update-theloai.validator.js
import { z } from "zod";
export const updateTheLoaiSchema = z.object({
  TenTheLoai: z.string().optional(),
});
export function validateUpdateTheLoai(data) {
  return updateTheLoaiSchema.parse(data);
}
