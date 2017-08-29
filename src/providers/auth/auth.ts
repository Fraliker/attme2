import { Injectable } from '@angular/core';
//import 'rxjs/add/operator/map';
import firebase from 'firebase';
import {AngularFireAuth} from "angularfire2/auth";
import {Observable} from "rxjs/Observable";

@Injectable()
export class AuthProvider {
  public fireAuth:firebase.auth.Auth;
  public userProfileRef:firebase.database.Reference;

  private authState: Observable<firebase.User>
  private currentUser: firebase.User = null;

  constructor(public afAuth: AngularFireAuth) {
    this.fireAuth = firebase.auth();
    this.userProfileRef = firebase.database().ref('/userProfile');

    this.authState = this.afAuth.authState;
    this.authState.subscribe(user => {
      if (user) {
        this.currentUser = user;
      } else {
        this.currentUser = null;
      }
    });
  }

  loginUser(email: string, password: string): firebase.Promise<any> {
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }

  signupUser(email: string, password: string): firebase.Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password).then( newUser => {
      this.userProfileRef.child(newUser.uid).set({
        email: email
      });
    });
  }

  resetPassword(email: string): firebase.Promise<void> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): firebase.Promise<void> {
    this.userProfileRef.child(this.afAuth.auth.currentUser.uid).off();
    return this.afAuth.auth.signOut();
  }

  getActiveUser() {
    return firebase.auth().currentUser;
  }

  createUserInvite(email:string) {
    this.fireAuth.createUserWithEmailAndPassword(email, 'Welcome.1')
      .then(
        (success) => {
          let user:any = firebase.auth().currentUser;
          console.log(user);
          user.sendEmailVerification().then(
            (success) => {console.log("please verify your email")
            }
          ).catch(
            (err) => {
              //this.error = err;
              console.log('errA');
              console.log(err);
            }
          )
        }
      )
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = 'uth/weak-password';
        var errorMessage = error.message;
        if (errorCode == 'auth/weak-password') {
          alert('The password is too weak.');
        } else {
          alert(errorMessage);
        }
        console.log(error);
      })
    // this.fireAuth.createUserWithEmailAndPassword({
    //   email: email,
    //   password: '$Testpswd.1'
    // }).then(
    //   (success) => {
    //     let user:any = firebase.auth().currentUser;
    //     user.sendEmailVerification().then(
    //       (success) => {console.log("please verify your email")}
    //     ).catch(
    //       (err) => {
    //         this.error = err;
    //       }
    //     )
    //
    //   }).catch(
    //   (err) => {
    //     this.error = err;
    //   })
  }
}
