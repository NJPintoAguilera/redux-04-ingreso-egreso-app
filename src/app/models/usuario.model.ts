export class Usuario {
  static fromFirebase({ email, nombre, uid }) {
    return new Usuario(uid, nombre, email);
  }
  constructor(
    public uid: string,
    public nombre: string,
    public email: string
  ) {}
}
