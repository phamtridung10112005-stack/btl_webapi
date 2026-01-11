import { z } from "zod";

export const updateHoaDonSchema = z.object({
  user_id: z.int().optional(),
  // TongTien: z.coerce.number().optional(),
  NgayLap: z.coerce.date().optional(),
  TrangThai: z.enum(['ChoXacNhan', 'DangGiao', 'DaGiao', 'DaHuy']).optional(),
  DiaChiGiaoHang: z.string().optional(),
  MaGiamGia: z.string().optional().nullable(),
  SoDienThoai: z.string().min(10,"So dien thoai phai du 10 so").optional(),
  GhiChu: z.string().max(255, "Tối đa 255 ký tự").optional(),
  HoTen: z.string().min(1, "Họ tên người nhận không được để trống").max(50, "Tối đa 50 ký tự").optional(),
  PhuongThucThanhToan: z.enum(['COD', 'Pay']).optional()
});

export function validateUpdateHoaDon(data) {
  return updateHoaDonSchema.parse(data);
}