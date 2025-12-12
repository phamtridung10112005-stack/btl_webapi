// File: update-sach.dto.js
export class UpdateSachDTO {
  constructor({ TenSach, MaTheLoai, MaNguoiDich, MaNXB, GiaSach, NamXuatBan, SoTrang, MoTaNoiDung, LinkHinhAnh }) {
    this.TenSach = TenSach;
    this.MaTheLoai = MaTheLoai;
    this.MaNguoiDich = MaNguoiDich;
    this.MaNXB = MaNXB;
    this.GiaSach = GiaSach;
    this.NamXuatBan = NamXuatBan;
    this.SoTrang = SoTrang;
    this.MoTaNoiDung = MoTaNoiDung;
    this.LinkHinhAnh = LinkHinhAnh;
  }
}
