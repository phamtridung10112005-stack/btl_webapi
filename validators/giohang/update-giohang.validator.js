import { z } from "zod";
export const updateGioHangSchema = z.object({
  SoLuong: z.int("Số lượng sản phẩm phải là số nguyên").min(1, "Số lượng phải lớn hơn 0").optional(),
  NgayThem: z.string().refine((d) => !isNaN(Date.parse(d)), "NGAYTAO is required").transform((d) => new Date(d))
});
export function validateUpdateGioHang(data) {
  return updateGioHangSchema.parse(data);
}
