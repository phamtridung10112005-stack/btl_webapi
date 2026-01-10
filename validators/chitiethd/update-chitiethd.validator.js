// File: update-chitiethd.validator.js
import { z } from "zod";
export const updateChiTietHDSchema = z.object({
  SoLuong: z.int().min(1, "Số lượng phải lớn hơn 0").optional(),
});
export function validateUpdateChiTietHD(data) {
  return updateChiTietHDSchema.parse(data);
}
