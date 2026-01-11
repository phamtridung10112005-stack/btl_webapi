export class UpdateUserDTO {
  constructor({ username, email, phone, password }) {
    this.username = username;
    this.email = email;
    this.phone = phone || null;
    
    // [THÊM DÒNG NÀY]
    this.password = password;
  }
}