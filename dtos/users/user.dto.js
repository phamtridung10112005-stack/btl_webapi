export class UserDTO {
  constructor({ id, username, email, phone }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.phone = phone || null;
  }
}
