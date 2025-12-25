export class CreateGioHangDTO {
  constructor({  MaGioHang, user_id, MaSach, SoLuong, NgayThem }) {
    this.MaGioHang = MaGioHang;
    this.user_id = user_id;
    this.MaSach = MaSach;
    this.SoLuong = SoLuong;
    this.NgayThem = NgayThem;

  }
}
