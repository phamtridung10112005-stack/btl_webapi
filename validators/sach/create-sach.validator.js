import { z } from "zod";

export const createSachSchema = z.object({
  TenSach: z.string().min(1, 'TenSach is required'),
  MaTheLoai: z.coerce.number({ required_error: 'MaTheLoai is required' }),
  TenNguoiDich: z.string().nullable().optional(),
  MaNXB: z.coerce.number({ required_error: 'MaNXB is required' }),
  GiaSach: z.coerce.number({ required_error: 'GiaSach is required' }),
  NamXuatBan: z.coerce.date({ required_error: 'NamXuatBan is required' }),
  SoTrang: z.coerce.number({ required_error: 'SoTrang is required' }),
  MoTaNoiDung: z.string().optional(),
  LinkHinhAnh: z.string().optional(),
  YeuThich: z.coerce.number().min(0).max(1).optional().default(0),
  SoLuongDaBan: z.coerce.number().optional().default(0),
  MaGiamGia: z.string().optional().nullable(),

  // 🔥 THÊM DÒNG NÀY:
  AuthorIds: z.array(z.number()).optional()
});

export function validateCreateSach(data) {
  return createSachSchema.parse(data);
}