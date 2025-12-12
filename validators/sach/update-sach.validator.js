// File: update-sach.validator.js
import { z } from "zod";
export const updateSachSchema = z.object({
  TenSach: z.string().optional(),
  MaTheLoai: z.int().optional(),
  MaNguoiDich: z.int().optional(),
  MaNXB: z.int().optional(),
  GiaSach: z.float32().optional(),
  NamXuatBan: z.string().refine((d) => !isNaN(Date.parse(d)), 'NamXuatBan is required' ),
  SoTrang: z.int().optional(),
  MoTaNoiDung: z.string().optional(),
  LinkHinhAnh: z.string().optional(),
});
export function validateUpdateSach(data) {
  return updateSachSchema.parse(data);
}
