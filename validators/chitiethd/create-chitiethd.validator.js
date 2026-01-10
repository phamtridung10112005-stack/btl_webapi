// File: create-chitiethd.validator.js
import { z } from "zod";
export const createChiTietHDSchema = z.object({
  MaHoaDon: z.int({ required_error: 'MaHoaDon is required' }),
  MaSach: z.int().min(1, 'MaSach is required'),
  SoLuong: z.int({ required_error: 'SoLuong is required' }),
});
export function validateCreateChiTietHD(data) {
  return createChiTietHDSchema.parse(data);
}
