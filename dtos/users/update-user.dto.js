export class UpdateUserDTO {
  constructor({ name, email, phone }) {
    this.name = name;
    this.email = email;
    this.phone = phone || null;
  }
}
