import { z } from "zod";

export const createHoaDonSchema = z.object({
  user_id: z.int({ required_error: 'user_id is required' }),  
  // SỬA Ở ĐÂY: Dùng coerce để ép kiểu chuỗi "100000" thành số 100000
  // TongTien: z.coerce.number({ required_error: 'TongTien is required' }), 
  NgayLap: z.coerce.date().optional(),
  TrangThai: z.enum(['ChoXacNhan', 'DangGiao', 'DaGiao', 'DaHuy']).optional(),
  DiaChiGiaoHang: z.string({ required_error: 'DiaChiGiaoHang is required' }),
  MaGiamGia: z.string().optional().nullable(),
  SoDienThoai: z.string().min(10,"So dien thoai phai du 10 so").optional(),
  GhiChu: z.string().max(255, "Tối đa 255 ký tự").optional()
});

export function validateCreateHoaDon(data) {
  return createHoaDonSchema.parse(data);
}