export class SachDTO {
  constructor({ MaSach, TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, YeuThich, SoLuongDaBan, MaGiamGia }) {
    this.MaSach = MaSach;
    this.TenSach = TenSach;
    this.MaTheLoai = MaTheLoai;
    this.TenNguoiDich = TenNguoiDich; // Đã đổi từ MaNguoiDich
    this.MaNXB = MaNXB;
    this.GiaSach = GiaSach;
    this.NamXuatBan = NamXuatBan;
    this.SoTrang = SoTrang;
    this.MoTaNoiDung = MoTaNoiDung;
    this.LinkHinhAnh = LinkHinhAnh;
    this.YeuThich = YeuThich;         // Mới
    this.SoLuongDaBan = SoLuongDaBan; // Mới
    this.MaGiamGia = MaGiamGia;       // Mới
  }
}