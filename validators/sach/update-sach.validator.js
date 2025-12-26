import { z } from "zod";

export const updateSachSchema = z.object({
  TenSach: z.string().optional(),
  MaTheLoai: z.coerce.number().optional(),
  TenNguoiDich: z.string().optional().nullable(),
  MaNXB: z.coerce.number().optional(),
  GiaSach: z.coerce.number().optional(),
  NamXuatBan: z.coerce.date().optional(),
  SoTrang: z.coerce.number().optional(),
  MoTaNoiDung: z.string().optional(),
  LinkHinhAnh: z.string().optional(),
  
  // Các trường mới
  YeuThich: z.coerce.number().min(0).max(1).optional(),
  SoLuongDaBan: z.coerce.number().optional(),
  MaGiamGia: z.string().optional().nullable(),
});

export function validateUpdateSach(data) {
  return updateSachSchema.parse(data);
}