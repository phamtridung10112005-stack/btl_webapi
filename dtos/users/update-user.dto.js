export class UpdateUserDTO {
  constructor({ username, email, phone }) {
    this.username = username;
    this.email = email;
    this.phone = phone || null;
  }
}
