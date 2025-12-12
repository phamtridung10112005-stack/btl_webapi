// File: create-sachtacgia.validator.js
import { z } from "zod";
export const createSachTacGiaSchema = z.object({
  MaSach: z.int({ required_error: 'MaSach is required' }),
  MaTacGia: z.int().min(1, 'MaTacGia is required'),
});
export function validateCreateSachTacGia(data) {
  return createSachTacGiaSchema.parse(data);
}
