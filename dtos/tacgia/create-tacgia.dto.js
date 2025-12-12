// File: create-tacgia.dto.js
export class CreateTacGiaDTO {
  constructor({  MaTacGia, TenTacGia,MoTa  }) {
    this.MaTacGia = MaTacGia;
    this.TenTacGia = TenTacGia;
    this.MoTa=MoTa;
  }
}
