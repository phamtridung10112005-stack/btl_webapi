// File: update-tacgia.validator.js
import { z } from "zod";
export const updateTacGiaSchema = z.object({
  TenTacGia: z.string().optional(),
  MoTa: z.string().optional(),
});
export function validateUpdateTacGia(data) {
  return updateTacGiaSchema.parse(data);
}
