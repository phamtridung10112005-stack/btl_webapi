// File: update-giamgia.validator.js
import { z } from "zod";
export const updateGiamGiaSchema = z.object({
  PhanTramGiam: z.int().optional(),
});
export function validateUpdateGiamGia(data) {
  return updateGiamGiaSchema.parse(data);
}
