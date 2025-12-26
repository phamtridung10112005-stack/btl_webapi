export class HoaDonDTO {
  constructor({ MaHoaDon, user_id, MaSach, SoLuong, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia }) {
    this.MaHoaDon = MaHoaDon;
    this.user_id = user_id;
    this.MaSach = MaSach;
    this.SoLuong = SoLuong;
    this.TongTien = TongTien; // Decimal/Double
    this.NgayLap = NgayLap;
    this.TrangThai = TrangThai;
    this.DiaChiGiaoHang = DiaChiGiaoHang;
    this.MaGiamGia = MaGiamGia;
  }
}