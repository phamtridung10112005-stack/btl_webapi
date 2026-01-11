export class CreateUserDTO {
  constructor({ username, email, phone, password, role }) {
    this.username = username;
    this.email = email;
    this.phone = phone || null;
    
    // [BẮT BUỘC THÊM 2 DÒNG NÀY]:
    this.password = password;
    this.role = role || 'USER';
  }
}