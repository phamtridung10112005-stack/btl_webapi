// File: create-tacgia.validator.js
import { z } from "zod";
export const createTacGiaSchema = z.object({
  MaTacGia: z.int({ required_error: 'MaTacGia is required' }),
  TenTacGia: z.string().min(1, 'TenTacGia is required'),
  MoTa: z.string({ required_error: 'MoTa is required' }),
});
export function validateCreateTacGia(data) {
  return createTacGiaSchema.parse(data);
}
