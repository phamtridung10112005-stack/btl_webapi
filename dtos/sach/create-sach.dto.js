export class CreateSachDTO {
  constructor({ TenSach, MaTheLoai, TenNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh, YeuThich, SoLuongDaBan, MaGiamGia, AuthorIds }) {
    // Không truyền MaSach vì là AUTO_INCREMENT
    this.TenSach = TenSach;
    this.MaTheLoai = MaTheLoai;
    this.TenNguoiDich = TenNguoiDich;
    this.MaNXB = MaNXB;
    this.GiaSach = GiaSach;
    this.NamXuatBan = NamXuatBan;
    this.SoTrang = SoTrang;
    this.MoTaNoiDung = MoTaNoiDung;
    this.LinkHinhAnh = LinkHinhAnh;
    this.YeuThich = YeuThich || 0;
    this.SoLuongDaBan = SoLuongDaBan || 0;
    this.MaGiamGia = MaGiamGia || null;

    // 🔥 THÊM DÒNG NÀY:
    this.AuthorIds = AuthorIds;
  }
}