// File: update-sachtacgia.validator.js
import { z } from "zod";
export const updateSachTacGiaSchema = z.object({
  MaTacGia: z.int().optional(),
});
export function validateUpdateSachTacGia(data) {
  return updateSachTacGiaSchema.parse(data);
}
