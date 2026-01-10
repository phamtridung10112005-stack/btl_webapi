// File: update-giamgia.dto.js
export class UpdateGiamGiaDTO {
  constructor({ PhanTramGiam, NgayBatDau, NgayKetThuc, SoLuong }) {
    this.PhanTramGiam = PhanTramGiam;
    this.NgayBatDau = NgayBatDau;
    this.NgayKetThuc = NgayKetThuc;
    this.SoLuong = SoLuong;
  }
}
