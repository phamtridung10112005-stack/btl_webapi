import { z } from "zod";
export const updateGioHangSchema = z.object({
  user_id: z.int().optional(),
  MaSach: z.int().optional(),
  SoLuong: z.int().optional(),
  NgayThem: z.coerce.date().optional(),

});
export function validateUpdateGioHang(data) {
  return updateGioHangSchema.parse(data);
}
