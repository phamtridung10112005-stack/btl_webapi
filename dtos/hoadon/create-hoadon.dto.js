export class CreateHoaDonDTO {
  constructor({ user_id, MaSach, SoLuong, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia }) {
    this.user_id = user_id;
    this.MaSach = MaSach;
    this.SoLuong = SoLuong;
    this.TongTien = TongTien;
    this.NgayLap = NgayLap;
    this.TrangThai = TrangThai;
    this.DiaChiGiaoHang = DiaChiGiaoHang;
    this.MaGiamGia = MaGiamGia;
  }
}