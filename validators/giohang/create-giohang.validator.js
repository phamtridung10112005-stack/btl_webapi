import { z } from "zod";
export const createGioHangSchema = z.object({
  MaGioHang: z.int({ required_error: 'MaGioHang is required' }),
  user_id: z.int().min(1, 'user_id is required'),
  MaSach: z.int({ required_error: 'MaSach is required' }),
  SoLuong: z.int({ required_error: 'SoLuong is required' }),
  NgayThem: z.coerce.date({ required_error: 'NgayThem is required' }),

});
export function validateCreateGioHang(data) {
  return createGioHangSchema.parse(data);
}
