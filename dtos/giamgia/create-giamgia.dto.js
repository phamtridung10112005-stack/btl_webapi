// File: create-giamgia.dto.js
export class CreateGiamGiaDTO {
  constructor({ MaGiamGia, PhanTramGiam, NgayBatDau, NgayKetThuc, SoLuong }) {
    this.MaGiamGia = MaGiamGia;
    this.PhanTramGiam = PhanTramGiam;
    this.NgayBatDau = NgayBatDau;
    this.NgayKetThuc = NgayKetThuc;
    this.SoLuong = SoLuong;
  }
}
