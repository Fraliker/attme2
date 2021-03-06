import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class ProfileProvider {
  public userProfile:firebase.database.Reference;
  public currentUser:firebase.User;

  constructor() {
    firebase.auth().onAuthStateChanged( user => {
      if (user){
        this.currentUser = user;
        this.userProfile = firebase.database().ref(`/userProfile/${user.uid}`);
      }
    });
  }

  getUserProfile(): firebase.database.Reference {
    return this.userProfile;
  }

  updateName(firstName: string, lastName: string): firebase.Promise<void> {
    return this.userProfile.update({
      firstName: firstName,
      lastName: lastName,
    });
  }

  updateDOB(birthDate: string): firebase.Promise<any> {
    return this.userProfile.update({
      birthDate: birthDate,
    });
  }

  updateEmail(newEmail: string, password: string): firebase.Promise<any> {
    const credential =  firebase.auth.EmailAuthProvider
      .credential(this.currentUser.email, password);

    return this.currentUser.reauthenticateWithCredential(credential).then( user => {
      this.currentUser.updateEmail(newEmail).then( user => {
        this.userProfile.update({ email: newEmail });
      });
    });
  }

  updatePassword(newPassword: string, oldPassword: string): firebase.Promise<any> {
    const credential =  firebase.auth.EmailAuthProvider
      .credential(this.currentUser.email, oldPassword);

    return this.currentUser.reauthenticateWithCredential(credential).then( user => {
      this.currentUser.updatePassword(newPassword).then( user => {
        console.log("Password Changed");
      }, error => {
        console.log(error);
      });
    });
  }

  updateimage(imageUrl) {
    var promise = new Promise((resolve, reject) => {
      this.currentUser.updateProfile({
        displayName: this.currentUser.displayName,
        photoURL: imageUrl
      }).then(() => {
        this.userProfile.update({
          displayName: this.currentUser.displayName,
          photoURL: imageUrl,
          //uid: this.currentUser.uid
        }).then(() => {
          resolve({ success: true });
        }).catch((err) => {
          reject(err);
        })
      }).catch((err) => {
        reject(err);
      })
    })
    return promise;
  }


  // uploadImage(image: string): any {
  //   let storageRef = firebase.storage().ref();
  //   let imageName = this.generateUUID();
  //
  //   let imageRef = storageRef.child(`${this.currentUser.uid}/${imageName}.jpg`);
  //   return imageRef.putString(image, 'data_url');
  // }
  //
  // getImage(userId: string, imageId: string): any {
  //   let storageRef = firebase.storage().ref();
  //   let imageRef = storageRef.child(`${this.currentUser.uid}/${imageId}`);
  //   return imageRef.getDownloadURL();
  // }
  //
  //
  // private generateUUID(): string {
  //   function s4() {
  //     return Math.floor((1 + Math.random()) * 0x10000)
  //       .toString(16)
  //       .substring(1);
  //   }
  //   return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
  //     s4() + '-' + s4() + s4() + s4();
  // }
}
