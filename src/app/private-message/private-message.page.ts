import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {CreateClassPage } from '../create-class/create-class.page';

@Component({
  selector: 'app-private-message',
  templateUrl: './private-message.page.html',
  styleUrls: ['./private-message.page.scss'],
})
export class PrivateMessagePage implements OnInit {
  /**
   * @member notifications contains the array of notification messages
   * @member userDetails Contains the user details who is logged in from local storage
   * @member noDataFound used for diplaying the message when no child found
   * @member lang Contains the language translation object
   */
  notifications: any = [];
  noRecordFound: string = '';
  lang: any = {};
  userDetails: any = {};
  imageModal:boolean = false;
  imageUrl:string = ""
  /**
     * Messages constructor
     * @param navCtrl Use for navigation between pages
     * @param app   Root app 
     * @param dataProvider  Use for getting data from the API
     * @param authProvider  Use for authentication purpose
   */
  constructor(public navCtrl: NavController, 
  			  public authProvider: AuthService, 
  			  //public app: App,
    		  public dataProvider: DataService, 
    		  public translate: TranslateService,
              private router:Router,
              private route : ActivatedRoute,
    		  public zone:NgZone, 
    		  public alertCtrl: AlertController) {
    this.translate.get("alertmessages").subscribe((res) => {
      this.lang = res;
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
  ionViewWillEnter() {
    if (localStorage.getItem("userloggedin")) {
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      let data = {
        "user_no": this.userDetails.details.user_no,
        "school_id": this.userDetails.details.school_id,
        "session_id": this.userDetails.session_id
      };
      this.dataProvider.showLoading();
      this.dataProvider.getNotifications(data).then(response => {
        this.dataProvider.hideLoading();
        if (response.session) {
          console.log(response);
          this.notifications = response.data;
          if (this.notifications.length == 0) {
            this.noRecordFound = this.lang.no_private_msg;
          }
        } else {
          this.authProvider.flushLocalStorage();
          this.dataProvider.errorALertMessage(response.message);
          this.router.navigate(['login'], { replaceUrl: true });
        }
      }).catch(error => {
        this.dataProvider.hideLoading();
        // this.dataProvider.errorALertMessage(error);
      })
    } else {
      this.dataProvider.hideLoading();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
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

  reloadData(){
        // this.dataProvider.showLoading();
    if (localStorage.getItem("userloggedin")) {
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      let data = {
        "user_no": this.userDetails.details.user_no,
        "school_id": this.userDetails.details.school_id,
        "session_id": this.userDetails.session_id
      };
      this.dataProvider.getNotifications(data).then(response => {
        // this.dataProvider.hideLoading();
        if (response.session) {
          this.notifications = response.data;
          if (this.notifications.length == 0) {
            this.noRecordFound = this.lang.no_private_msg;
          }
        } else {
          this.authProvider.flushLocalStorage();
          this.dataProvider.errorALertMessage(response.message);
          this.router.navigate(['login'], { replaceUrl: true });
        }
      }).catch(error => {
        this.dataProvider.hideLoading();
        // this.dataProvider.errorALertMessage(error);
      })
    } else {
      // this.dataProvider.hideLoading();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }

  /**
   * to delete the notification
   * @param notificationId notification id which user wants to delete
   * @param index index of the notification message
   */
  async deleteNotification(notificationId, index) {
   const alert=await this.alertCtrl.create({
      message: this.lang.want_to_delete,
      backdropDismiss: false,
      buttons: [
        {
          text: this.lang.no,
        },
        {
          text: this.lang.yes,
          handler: () => {
            this.dataProvider.showLoading();
            let data = {
              user_no: this.userDetails.details.user_no,
              nid: notificationId,
              session_id: this.userDetails.session_id
            }
            this.dataProvider.deleteNotification(data).then((response) => {
              this.dataProvider.hideLoading();
              if (response.session) {
                this.dataProvider.showToast(response.message);
                this.notifications.splice(index, 1);
              } else {
                this.authProvider.flushLocalStorage();
                this.dataProvider.errorALertMessage(response.message);
                this.router.navigate(['login'], { replaceUrl: true });
              }
            }).catch((error) => {
              this.dataProvider.hideLoading();
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
    this.dataProvider.showLoading();
    this.dataProvider.downloadImage(imageUrl).then((res)=>{
      this.dataProvider.hideLoading();
      this.dataProvider.showToast(this.lang.download_complete);
    }).catch((error)=>{
      this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(error);
    })
  }

  ngOnInit() {
  }

}
