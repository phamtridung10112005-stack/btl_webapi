// File: create-giamgia.validator.js
import { z } from "zod";
export const createGiamGiaSchema = z.object({
  MaGiamGia: z.string({ required_error: 'MaGiamGia is required' }),
  PhanTramGiam: z.int().min(1, 'PhanTramGiam is required'),
});
export function validateCreateGiamGia(data) {
  return createGiamGiaSchema.parse(data);
}