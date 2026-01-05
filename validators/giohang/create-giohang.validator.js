import { z } from "zod";
export const createGioHangSchema = z.object({
  User_ID: z.int().min(1, 'User_ID is required'),
  MaSach: z.int({ required_error: 'MaSach is required' }),
  SoLuong: z.int({ required_error: 'SoLuong is required' }).min(1, "Số lượng phải lớn hơn 0"),
});
export function validateCreateGioHang(data) {
  return createGioHangSchema.parse(data);
}
