import { z } from "zod";

export const updateHoaDonSchema = z.object({
  user_id: z.int().optional(),
  MaSach: z.int().optional(),
  SoLuong: z.int().optional(),
  
  // SỬA Ở ĐÂY: Dùng coerce
  TongTien: z.coerce.number().optional(),
  
  NgayLap: z.coerce.date().optional(),
  TrangThai: z.enum(['ChoXacNhan', 'DangGiao', 'DaGiao', 'DaHuy']).optional(),
  DiaChiGiaoHang: z.string().optional(),
  MaGiamGia: z.string().optional().nullable(),
});

export function validateUpdateHoaDon(data) {
  return updateHoaDonSchema.parse(data);
}