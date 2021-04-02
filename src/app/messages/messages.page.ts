import { Component, OnInit } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';

import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import {LoaderComponent} from '../components/loader/loader.component';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {


  notifications:any = [];
  userType:any;
  userDetails:any = {};
  noRecordFound:string;
  lang:any = {};
  imageModal:boolean = false;
  imageUrl:string = "";
  popOver:any;
  constructor(public navCtrl: NavController,
  			  //public app: App,
  			  public translate: TranslateService,
              public dataProvider: DataService,
              public authProvider: AuthService,
              public popoverController: PopoverController,
              public alertCtrl: AlertController,
              private router:Router) {
                this.translate.get("alertmessages").subscribe((res)=>{
                  this.lang = res;
                })
                this.dataProvider.language.subscribe((resq)=>{
                  this.translate.get("alertmessages").subscribe((res)=>{
                     // console.log(this.lang);
                    this.lang = res;
                  })
                })
                this.authProvider.event.subscribe((res)=>{
                //  console.log('change',res)
                  if(res.changeUser){
                    this.reloadData();
                  }
                })
  }

  /**
   * Ionic navigation event will run when page is loaded
   */
  ngOnInit() {
 
  }
  ionViewWillEnter() {
          this.presentPopover();
    if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType = this.userDetails.details.user_type;
      let data = {
        "user_no": this.userDetails.details.user_no,
        "school_id": this.userDetails.details.school_id,
        "session_id": this.userDetails.session_id
      };
      this.dataProvider.getNotifications(data).then(response=>{
       this.dissmissPopOver();
        if(response.session){
         this.notifications = response.data;
         if(this.notifications.length == 0){
          this.noRecordFound = this.lang.no_private_msg;
         }
        }else{
          this.authProvider.flushLocalStorage();
          this.router.navigate(['login'], { replaceUrl: true });
          this.dataProvider.errorALertMessage(response.message);
        //  this.app.getRootNav().setRoot("LoginPage");

        }
      }).catch(error =>{
        console.log(error);
       this.dissmissPopOver();
        // this.dataProvider.errorALertMessage(error);
      })
    }else{
     this.dissmissPopOver();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
     // this.app.getRootNav().setRoot("LoginPage");
    }
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.reloadData();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }


    async presentPopover() {
     this.popOver = await this.popoverController.create({
      component: LoaderComponent,
      backdropDismiss:true,
      //event: ev,
      translucent: false,
     // animated:true,
      cssClass:'loaderStyle',
     // mode:"ios"
    });
    return this.popOver.present();
    
  }
  dissmissPopOver(){
    this.popOver.dismiss();
  }

  reloadData(){
       //    this.presentPopover();
    if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType = this.userDetails.details.user_type;
      let data = {
        "user_no": this.userDetails.details.user_no,
        "school_id": this.userDetails.details.school_id,
        "session_id": this.userDetails.session_id
      };
      this.dataProvider.getNotifications(data).then(response=>{
      //  this.dissmissPopOver();
        if(response.session){
         this.notifications = response.data;
         if(this.notifications.length == 0){
          this.noRecordFound = this.lang.no_private_msg;
         }
        }else{
          this.authProvider.flushLocalStorage();
          this.router.navigate(['login'], { replaceUrl: true });
          this.dataProvider.errorALertMessage(response.message);
        //  this.app.getRootNav().setRoot("LoginPage");

        }
      }).catch(error =>{
        console.log(error);
       // this.dissmissPopOver();
        // this.dataProvider.errorALertMessage(error);
      })
    }else{
     // this.dissmissPopOver();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
     // this.app.getRootNav().setRoot("LoginPage");
    }

  }

  /**
   * Open mail composer page
   */
  openComposer() {
   // this.navCtrl.push("SendmessagePage")
   this.router.navigate(['tabs/sendmessage']);
  }

  /**
   * to delete the notification
   * @param notificationId notification id which user wants to delete
   * @param index index of the notification message
   */
 async deleteNotification(notificationId, index){
   const alert= await this.alertCtrl.create({
      message: this.lang.want_to_delete,
      backdropDismiss: false,
      buttons: [
        {
          text: this.lang.no,
        },
        {
          text: this.lang.yes,
          handler: ()=>{
            this.presentPopover();
            let data = {
              user_no: this.userDetails.details.user_no,
              nid: notificationId,
              session_id: this.userDetails.session_id
            }
            this.dataProvider.deleteNotification(data).then((response)=>{
              this.dissmissPopOver();
              if(response.session){
              this.dataProvider.showToast(response.message);
              this.notifications.splice(index, 1);
              }else{
                this.authProvider.flushLocalStorage();
                this.dataProvider.errorALertMessage(response.message);
                //this.app.getRootNav().setRoot("LoginPage");
              }
            }).catch((error)=>{
              this.dissmissPopOver();
              this.dataProvider.errorALertMessage(error);
            })
          }
        }
      ]
    })
   await alert.present();
  }

  openImageContainer(url){
    this.imageUrl = url;
    this.imageModal = true;
  }

  hideUserImageModal(event: any) {
    if (event.target.className == "custom-modal-main") {
      this.imageModal = false;
    }
  }

  downloadImage(imageUrl){
    this.presentPopover();
    this.dataProvider.downloadImage(imageUrl).then((res)=>{
      this.dissmissPopOver();
      this.dataProvider.showToast(this.lang.download_complete);
    }).catch((error)=>{
      this.dissmissPopOver();
      this.dataProvider.errorALertMessage(error);
    })
  }

}
