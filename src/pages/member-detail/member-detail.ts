import {Component, OnInit} from '@angular/core';
import {AlertController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {MemberProvider} from "../../providers/member/member";
//import {FirebaseObjectObservable} from "angularfire2/database";
import {AuthProvider} from "../../providers/auth/auth";

@IonicPage({
  name: 'member-detail',
  segment: 'member-detail/:memberKey'
})
@Component({
  selector: 'page-member-detail',
  templateUrl: 'member-detail.html',
})
export class MemberDetailPage implements OnInit{
  private memberKey: any;

  public member: any;
  public isUserProfileExists: boolean = false;
  constructor(public navCtrl: NavController,
              public alertCtrl: AlertController,
              public navParams: NavParams,
              private memberSvc: MemberProvider,
              private authSvc: AuthProvider) {
    this.memberKey = this.navParams.get('memberKey');
  }

  ngOnInit(): void {
    //console.log(this.memberId);
    this.memberSvc.getMember(this.memberKey)
      .subscribe((data)=>{
        if (data.val()!=null) {
          this.member = data.val();
        }
      });

    this.memberSvc.findMemberId(this.memberKey)
      .subscribe((data) => {
        if (data.length>0) {
          this.isUserProfileExists = true;
        }
      });
  }


  updateName(){
    const alert = this.alertCtrl.create({
      message: "Your first name & last name",
      inputs: [
        {
          name: 'firstName',
          placeholder: 'Your first name',
          value: this.member.firstName
        },
        {
          name: 'lastName',
          placeholder: 'Your last name',
          value: this.member.lastName
        },
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.memberSvc.updateName(this.member.memberKey, data.firstName, data.lastName);
          }
        }
      ]
    });
    alert.present();
  }

  // updateDOB(birthDate){
  //   this.profileProvider.updateDOB(birthDate);
  // }

  updateEmail(){
    let alert = this.alertCtrl.create({
      inputs: [
        {
          name: 'newEmail',
          placeholder: 'Your new email',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            //let newEmail = data.newEmail;

            this.memberSvc.updateEmail(this.member.memberKey, data.newEmail).then( () =>{
              //this.userProfile.email = newEmail;
            }).catch(error => {
              console.log('ERROR: '+error.message);
            });
          }
        }
      ]
    });
    alert.present();
  }

  updateDOB(birthDate){
    //this.profileProvider.updateDOB(birthDate);
  }

  updateMemberId(){
    let alert = this.alertCtrl.create({
      inputs: [
        {
          name: 'newEmail',
          placeholder: 'Your member ID if any',
        }
      ],
      buttons: [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.memberSvc.updateMemberId(this.member.memberKey, data.memberId).then( () =>{
              //this.userProfile.email = newEmail;
            }).catch(error => {
              console.log('ERROR: '+error.message);
            });
          }
        }
      ]
    });
    alert.present();
  }

  onCreateInvite() {
    console.log(`onCreateInvite::${this.memberKey},${this.member.email}`);
    this.authSvc.createUserInvite(this.memberKey, this.member.lastName, this.member.firstName, this.member.email);

  }
}
