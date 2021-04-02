import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform,ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { ConnectNewMessagePage } from '../connect-new-message/connect-new-message.page';


@Component({
  selector: 'app-parentconnect',
  templateUrl: './parentconnect.page.html',
  styleUrls: ['./parentconnect.page.scss'],
})
export class ParentconnectPage implements OnInit {

   /**
   * @member chats contains the support chats
   * @member userDetails Contains the user details who is logged in from local storage
   * @member noDataFound used for diplaying the message when no child found
   * @member lang Contains the language translation object
   */
  lang:any = {};
  chats:any = [];
  noDataFound:string = '';
  userType:any;
  userDetails:any = {};
  imageUrl:string = '';
  imageModal:boolean = false;
  /**
   * Class list constructor
   * @param navCtrl Use for navigation between pages
   * @param dataProvider  Use for getting data from the API
   * @param authProvider  Use for authentication purpose
   * @param alertCtrl Ionic alert controller to show alert popup
   * @param translate used for translation service
   */
    constructor(public navCtrl: NavController,
  				public alertCtrl: AlertController,
  				public dataProvider: DataService,
                public modalCtrl: ModalController,
                public translate: TranslateService,
                public authProvider: AuthService,
              private route : ActivatedRoute,
              private router:Router,
              public zone:NgZone,
	            //public app: App,
	              public network: Network) {
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
  ionViewWillEnter(){
    if(localStorage.getItem("userloggedin")){
      this.getAllChats();
    }else{
      this.authProvider.flushLocalStorage();
      // this.app.getRootNav().setRoot("LoginPage");
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }
  reloadData(){
    if(localStorage.getItem("userloggedin")){
         // this.dataProvider.showLoading();
    this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType = this.userDetails.details.user_type;
      let data = {
        "user_no": this.userDetails.details.user_no,
        "school_id": this.userDetails.details.school_id,
        "session_id": this.userDetails.session_id,
        "user_type": this.userDetails.details.user_type
      };
      this.dataProvider.getConnectChatList(data).then(response=>{
      //  this.dataProvider.hideLoading();
      console.log(response);
        if(response.session){
          if(response.chatList){
            if(response.chatList.length > 0){
              this.chats = response.chatList;
              console.log(this.chats);
            }else{
              this.noDataFound = this.lang.no_connect_msg;
            }
          }
        }else{
          this.authProvider.flushLocalStorage();
           this.dataProvider.errorALertMessage(response.message);
          this.router.navigate(['login'], { replaceUrl: true });
        }
      }).catch(error =>{
      //  this.dataProvider.hideLoading();
        // this.dataProvider.errorALertMessage(error);
      })
    }else{
      this.authProvider.flushLocalStorage();
      // this.app.getRootNav().setRoot("LoginPage");
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }

  /**
   * Get all chats
   */
  getAllChats(loader:boolean=true){
    this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType = this.userDetails.details.user_type;
      let data = {
        "user_no": this.userDetails.details.user_no,
        "school_id": this.userDetails.details.school_id,
        "session_id": this.userDetails.session_id,
        "user_type": this.userDetails.details.user_type
      };
      if(loader) this.dataProvider.showLoading();
      this.dataProvider.getConnectChatList(data).then(response=>{
       this.dataProvider.hideLoading();
      console.log(response);
        if(response.session){
          if(response.chatList){
            if(response.chatList.length > 0){
              this.chats = response.chatList;
              console.log(this.chats);
            }else{
              this.noDataFound = this.lang.no_connect_msg;
            }
          }
        }else{
          this.authProvider.flushLocalStorage();
           this.dataProvider.errorALertMessage(response.message);
          this.router.navigate(['login'], { replaceUrl: true });
        }
      }).catch(error =>{
       this.dataProvider.hideLoading();
        // this.dataProvider.errorALertMessage(error);
      })
  }
  /**
   * Open modal popup to create the chat ticket
   */
 async createChatMessage(){
    if(this.network.type != this.network.Connection.UNKNOWN && this.network.type != this.network.Connection.NONE){
    const alert=await this.alertCtrl.create({
        header: this.lang.messageWarningHeader,
        message: this.lang.messageWarningbody,
        backdropDismiss: false,
        buttons: [
          {
            text: this.lang.alert_btn_cancel_text,
            role: "cancel"
          },
          {
            text: this.lang.alert_btn_accept_text,
            handler: ()=>{
            	this.createModal();
              // let modal = this.modalCtrl.create("ConnectNewMessagePage");
              // modal.present();
              // modal.onDidDismiss((data)=>{
              //   if(data){
              //     this.getAllChats();
              //   }
              // })
            }
          }
        ]
      })
    await alert.present();
    }else{
      this.dataProvider.showToast(this.lang.no_internet);
    }
  }
   async createModal(){
     const modal = await this.modalCtrl.create({
       component: ConnectNewMessagePage,
      });
   await modal.present();
    modal.onDidDismiss().then((refresh) => {
      if(refresh){
        this.getAllChats(false);
      }
    })
  }

  /**
   * Open chat screen for reply
   * @param chat chat object contains chat id, title, message .....
   */
  openChat(chat:any){
    console.log(chat)
    if(this.network.type != this.network.Connection.UNKNOWN && this.network.type != this.network.Connection.NONE){
   		const navigation: NavigationExtras = {
	      state : chat
	      };
   	this.zone.run(() => {
	        this.router.navigate(['connect-chat'], navigation);
	      });
   //  this.navCtrl.push("ConnectChatPage", {"chat": chat});
    }else{
      this.dataProvider.showToast(this.lang.no_internet);
    }
  }

  /**
   * Open chat screen for reply
   * @param chat chat object contains chat id, title, message .....
   */
 async closeTicket(chat:any){
   const alert=await this.alertCtrl.create({
      header: this.lang.alert,
      message: this.lang.want_to_close,
      buttons: [
        {
          text: this.lang.no,
          role: 'cancel'
        },
        {
          text: this.lang.yes,
          handler: ()=>{
            let data = {
              user_no: this.userDetails.details.user_no,
              chat_list_id: chat.id,
              session_id: this.userDetails.session_id
            }
            this.dataProvider.showLoading();
            this.dataProvider.closeParentConnectChat(data).then(response=>{
              this.dataProvider.hideLoading();
              if(response.session){
                chat.ticket_status = '1';
                this.dataProvider.showToast(response.message);
              }else{
                this.authProvider.flushLocalStorage();
                this.dataProvider.errorALertMessage(response.message);
                this.router.navigate(['login'], { replaceUrl: true });
              }
            }).catch(error =>{
              this.dataProvider.hideLoading();
              this.dataProvider.errorALertMessage(error);
            })
          }
        }
      ]
    })
   await alert.present();
  }

  /**
   * Open modal for reopening the ticket
   * @param chat chat object contains chat id, title, message .....
   */
  async reopenTicket(chat:any){
   const alert=await this.alertCtrl.create({
      header: this.lang.alert,
      message: this.lang.want_to_reopen,
      buttons: [
        {
          text: this.lang.no,
          role: 'cancel'
        },
        {
          text: this.lang.yes,
          handler: ()=>{
            let data = {
              user_no: this.userDetails.details.user_no,
              chat_list_id: chat.id,
              session_id: this.userDetails.session_id
            }
            this.dataProvider.showLoading();
            this.dataProvider.reopenParentConnectChat(data).then(response=>{
              this.dataProvider.hideLoading();
              if(response.session){
                chat.ticket_status = '0';
                this.dataProvider.showToast(response.message);
              }else{
                this.authProvider.flushLocalStorage();
                this.dataProvider.errorALertMessage(response.message);
                this.router.navigate(['login'], { replaceUrl: true });
              }
            }).catch(error =>{
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
