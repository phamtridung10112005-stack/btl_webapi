export class HoaDonDTO {
  constructor({ MaHoaDon, user_id, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia, SoDienThoai, GhiChu }) {
    this.MaHoaDon = MaHoaDon;
    this.user_id = user_id;
    this.TongTien = TongTien;
    this.NgayLap = NgayLap;
    this.TrangThai = TrangThai;
    this.DiaChiGiaoHang = DiaChiGiaoHang;
    this.MaGiamGia = MaGiamGia;;
    this.SoDienThoai = SoDienThoai;
    this.GhiChu = GhiChu;
  }
}