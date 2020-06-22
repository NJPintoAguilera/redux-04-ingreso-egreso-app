import { Injectable } from '@angular/core';

import 'firebase/firestore';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { map } from 'rxjs/operators';
import { Usuario } from '../models/usuario.model';
import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import { AppState } from '../app.reducer';
import * as authActions from '../auth/auth.actions';
import * as ingresoEgresoActions from '../ingreso-egreso/ingreso-egreso.actions';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userSubscription: Subscription;
  private _user: Usuario;

  constructor(
    public auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private store: Store<AppState>
  ) {}

  get user() {
    return this._user;
  }

  initAuthListener() {
    this.auth.authState.subscribe((fireBaseUser) => {
      /* console.log(fireBaseUser); console.log(fireBaseUser?.uid); console.log(fireBaseUser?.email); */
      if (fireBaseUser) {
        // existe
        this.userSubscription = this.firestore
          .doc(`${fireBaseUser.uid}/usuario`)
          .valueChanges()
          .subscribe((firestoreUser: any) => {
            // console.log(firestoreUser);
            const user = Usuario.fromFirebase(firestoreUser);
            this._user = user;
            this.store.dispatch(authActions.setUser({ user: user }));
            this.store.dispatch(ingresoEgresoActions.unSetItems());
          });
      } else {
        // no existe
        this._user = null;
        this.userSubscription.unsubscribe();
        this.store.dispatch(authActions.unSetUser());
      }
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
