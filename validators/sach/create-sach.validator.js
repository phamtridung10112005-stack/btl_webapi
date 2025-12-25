import { z } from "zod";

export const createSachSchema = z.object({
  // Bỏ MaSach vì tự tăng
  TenSach: z.string().min(1, 'TenSach is required'),
  MaTheLoai: z.coerce.number({ required_error: 'MaTheLoai is required' }),
  TenNguoiDich: z.string().optional(), // Có thể null hoặc string
  MaNXB: z.coerce.number({ required_error: 'MaNXB is required' }),
  GiaSach: z.coerce.number({ required_error: 'GiaSach is required' }),
  NamXuatBan: z.coerce.date({ required_error: 'NamXuatBan is required' }),
  SoTrang: z.coerce.number({ required_error: 'SoTrang is required' }),
  MoTaNoiDung: z.string().optional(),
  LinkHinhAnh: z.string().optional(),
  
  // Các trường mới
  YeuThich: z.coerce.number().min(0).max(1).optional().default(0), // 0 hoặc 1
  SoLuongDaBan: z.coerce.number().optional().default(0),
  MaGiamGia: z.string().optional().nullable(),
});

export function validateCreateSach(data) {
  return createSachSchema.parse(data);
}