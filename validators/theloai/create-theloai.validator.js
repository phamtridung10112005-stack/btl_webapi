// File: create-theloai.validator.js
import { z } from "zod";
export const createTheLoaiSchema = z.object({
  MaTheLoai: z.int({ required_error: 'MaTheLoai is required' }),
  TenTheLoai: z.string().min(1, 'TenTheLoai is required'),
});
export function validateCreateTheLoai(data) {
  return createTheLoaiSchema.parse(data);
}
