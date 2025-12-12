// File: update-nhaxuatban.validator.js
import { z } from "zod";
export const updateNhaXuatBanSchema = z.object({
  TenNXB: z.string().optional(),
  DiaChi: z.string().optional(),
  SoDienThoai: z.string().optional(),
});
export function validateUpdateNhaXuatBan(data) {
  return updateNhaXuatBanSchema.parse(data);
}
