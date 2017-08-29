import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2/database";
import {AuthProvider} from "../auth/auth";

@Injectable()
export class MemberProvider {

  public memberKey: string;
  public isMemberExists: boolean;

  constructor(private af:AngularFireDatabase,
              private authService: AuthProvider,) {
  }

  getMembers(): FirebaseListObservable<any[]> {
    return this.af.list('/members',{
      query: {
        orderByChild: 'firstName'
      }
    });
  }

  updateMember($key: string, firstName, lastName, memberId,email) {
    let url = `/members/${$key}`;
    let data = this.getMemberJson(firstName, lastName, memberId, email);
    let memberRef = this.af.object(url);
    memberRef.update(data)
    //.then(_ => console.log('update!'))
    ;
  }

  addMember(firstName, lastName, memberId, email) {
    let data = this.getMemberJson(firstName, lastName, memberId, email);

    let url = `/members`;
    let membersRef = this.af.list(url);
    membersRef.push(data);
  }

  updateName($key: string, firstName, lastName): firebase.Promise<void> {
    let url = `/members/${$key}`;
    return this.af.object(url).update({
      firstName: firstName,
      lastName: lastName,
    });
  }

  private getMemberJson(firstName, lastName, memberId, email) {
    return {
      firstName: firstName,
      lastName: lastName,
      memberId: memberId,
      email: email
    };
  }

  findMemberId(memberKey: string) {
    console.log('find: '+ memberKey);
    return this.af.list(`/userProfile/`, {
      query: {
        orderByChild: 'memberKey',
        equalTo: memberKey,
        limitToFirst: 1
      },
      preserveSnapshot: true
    });
  }

  getMember(memberKey: string):FirebaseObjectObservable<any> {
    return this.af.object(`/members/${memberKey}`, { preserveSnapshot: true });
  }

  confirmMember(memberKey: string) {
    //console.log('confirm:' + memberKey);
    //TODO: need to add validation that this memberKey is not taken by userKey
    // query the userMember node if a memberKey exists
    const userKey = this.authService.getActiveUser().uid;
    let url = `/userMember/${userKey}/${memberKey}`;
    this.af.object(url).$ref.transaction(currentValue => {
      if (currentValue === null) {
        //return true;
        return{on : new Date().toISOString()};
      } else {
        //console.log('This username is taken. Try another one');
        //return Promise.reject(Error('username is taken'))
      }
    })
      .then( result => {
        // Good to go, user does not exist
        if (result.committed) {
          //console.log('user member assoc created');
          // let voteUrl = `/attendees/${eventKey}/${memberKey}/voteCount`;
          // let tagObs = this.af.database.object(voteUrl);
          // tagObs.$ref.transaction(tagValue => {
          //   return tagValue ? tagValue + 1 : 1;
          // });
        }
      })
      .catch( error => {
        // handle error
      });
  }

  isVerified() {

    const userKey = this.authService.getActiveUser().uid;
    let url = `/userMember/${userKey}`;
    let exists:boolean=false;
    const userMemberRef = this.af.object(url, { preserveSnapshot: true });

    userMemberRef.subscribe(data => {
      if(data.val()==null) {
        exists = false;
      } else {
        exists = true;
      }
    });
    return exists;
  }

  public getMemberKeyByUserKey() {
    const userKey = this.authService.getActiveUser().uid;
    let url = `/userMember/${userKey}`;
    return this.af.object(url, { preserveSnapshot: true });
  }

  updateEmail($key: string, newEmail: string) {
    let url = `/members/${$key}`;
    return this.af.object(url).update({
      email: newEmail
    });
  }

  updateMemberId(memberKey: string, memberId: string): firebase.Promise<void> {
    console.log(`U THERE?${memberKey}, ${memberId}`);
    console.log(memberKey);
    let url = `/members/${memberKey}`;
    return this.af.object(url).update({
      memberId: memberId
    });
  }
}
