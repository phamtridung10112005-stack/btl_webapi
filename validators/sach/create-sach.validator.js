// File: create-sach.validator.js
import { z } from "zod";
export const createSachSchema = z.object({
  MaSach: z.int({ required_error: 'MaSach is required' }),
  TenSach: z.string().min(1, 'TenSach is required'),
  MaTheLoai: z.int({ required_error: 'MaTheLoai is required' }),
  MaNguoiDich: z.int({ required_error: 'MaNguoiDich is required' }),
  MaNXB: z.int({ required_error: 'MaNXB is required' }),
  GiaSach: z.float32({ required_error: 'GiaSach is required' }),
  NamXuatBan: z.string().refine((d) => !isNaN(Date.parse(d)), 'NamXuatBan is required' ),
  SoTrang: z.int({ required_error: 'SoTrang is required' }),
  MoTaNoiDung: z.string({ required_error: 'MoTaNoiDung is required' }),
  LinkHinhAnh: z.string({ required_error: 'LinkHinhAnh is required' }),
});
export function validateCreateSach(data) {
  return createSachSchema.parse(data);
}
