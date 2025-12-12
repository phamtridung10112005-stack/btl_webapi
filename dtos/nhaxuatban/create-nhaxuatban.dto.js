// File: create-nhaxuatban.dto.js
export class CreateNhaXuatBanDTO {
  constructor({  MaNXB, TenNXB, DiaChi, SoDienThoai}) {
    this.MaNXB = MaNXB;
    this.TenNXB = TenNXB;
    this.DiaChi = DiaChi;
    this.SoDienThoai = SoDienThoai;
  }
}
