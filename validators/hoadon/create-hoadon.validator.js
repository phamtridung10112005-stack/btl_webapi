import { z } from "zod";

export const createHoaDonSchema = z.object({
  user_id: z.number().int({ required_error: 'user_id is required' }), // Sửa z.int thành z.number().int() nếu z.int báo lỗi
  // TongTien sẽ được tính ở backend, không cần validate từ client
  NgayLap: z.coerce.date().optional(),
  TrangThai: z.enum(['ChoXacNhan', 'DangGiao', 'DaGiao', 'DaHuy']).optional(),
  DiaChiGiaoHang: z.string({ required_error: 'DiaChiGiaoHang is required' }),
  MaGiamGia: z.string().optional().nullable(),
  SoDienThoai: z.string().min(10, "So dien thoai phai du 10 so").optional(),
  GhiChu: z.string().max(255, "Tối đa 255 ký tự").optional(),
  HoTen: z.string().min(1, "Họ tên người nhận không được để trống").max(50, "Tối đa 50 ký tự").optional(),
  PhuongThucThanhToan: z.enum(['COD', 'PAY']).optional(),

  // [BỔ SUNG QUAN TRỌNG] Cho phép nhận mảng ChiTiet
  ChiTiet: z.array(
    z.object({
      MaSach: z.number(),
      SoLuong: z.number().min(1)
    })
  ).optional()
});

export function validateCreateHoaDon(data) {
  return createHoaDonSchema.parse(data);
}