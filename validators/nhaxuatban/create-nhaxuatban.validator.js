// File: create-nhaxuatban.validator.js
import { z } from "zod";
export const createNhaXuatBanSchema = z.object({
  MaNXB: z.int({ required_error: 'MaNXB is required' }),
  TenNXB: z.string().min(1, 'TenNXB is required'),
  DiaChi: z.string({ required_error: 'DiaChi is required' }),
  SoDienThoai: z.string({ required_error: 'SoDienThoai is required' }),
});
export function validateCreateNhaXuatBan(data) {
  return createNhaXuatBanSchema.parse(data);
}
