import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    public auth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}

  initAuthListener() {
    this.auth.authState.subscribe((fireBaseUser) => {
      console.log(fireBaseUser);
      console.log(fireBaseUser?.uid);
      console.log(fireBaseUser?.email);
    });
  }

  crearUsuario(nombre: string, email: string, password: string) {
    // console.log({nombre, email, password});
    return this.auth
      .createUserWithEmailAndPassword(email, password)
      .then((firebaseUser) => {
        const newUser = new Usuario(firebaseUser.user.uid, nombre, email);
        return this.firestore
          .doc(`${firebaseUser.user.uid}/usuario`)
          .set({ ...newUser });
      });
  }

  loginUsuario(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  isAuth() {
    return this.auth.authState.pipe(
      map((fireBaseUser) => fireBaseUser != null)
    );
  }
}
