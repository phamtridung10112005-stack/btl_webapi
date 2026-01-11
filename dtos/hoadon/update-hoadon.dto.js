export class UpdateHoaDonDTO {
  // Thêm ChiTiet vào constructor
  constructor({ user_id, TongTien, NgayLap, TrangThai, DiaChiGiaoHang, MaGiamGia, SoDienThoai, GhiChu, HoTen, PhuongThucThanhToan, ChiTiet }) {
    this.user_id = user_id;
    this.TongTien = TongTien;
    this.NgayLap = NgayLap;
    this.TrangThai = TrangThai;
    this.DiaChiGiaoHang = DiaChiGiaoHang;
    this.MaGiamGia = MaGiamGia;
    this.SoDienThoai = SoDienThoai;
    this.GhiChu = GhiChu;
    this.HoTen = HoTen;
    this.PhuongThucThanhToan = PhuongThucThanhToan;
    this.ChiTiet = ChiTiet; // [MỚI]
  }
}