import { Component, OnInit,NgZone, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController,IonContent, Platform,ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {Location} from '@angular/common'; 
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'app-connect-chat',
  templateUrl: './connect-chat.page.html',
  styleUrls: ['./connect-chat.page.scss'],
})
export class ConnectChatPage implements OnInit {

//  @ViewChild(IonContent) contentArea: IonContent;
  @ViewChild('contentArea') private contentArea: any;

  /**
   * @member userDetails Contains the user details who is logged in from local storage
   * @member chat used to store the chat infromation coming from last page
   * @member message typing meessage
   * @member messages contains all the messages
   * @member lastMessageId contains the id of last message
   * @member chatInterval will store the interval 
   * @member lang Contains the language translation object
   */
  userDetails: any = {};
  chat: any = {};
  message: string = "";
  messages: any = [];
  lastMessageId: number = 0;
  chatInterval: any;
  attachment:string = '';
  lang:any = {}
  image:string = '';
  navData:any;
  /**
   * Class list constructor
   * @param navCtrl Use for navigation between pages
   * @param app   Root app 
   * @param dataProvider  Use for getting data from the API
   * @param authProvider  Use for authentication purpose
   * @param viewCtrl View controller 
   */
  constructor(public navCtrl: NavController, 
  			//  public viewCtrl: ViewController, 
  			//  public app: App,
  			  public translate: TranslateService,
    		  public dataProvider: DataService, 
    		  public authProvider: AuthService, 
    		 // public navParams: NavParams, 
    		  public alertCtrl: AlertController,
              private _location: Location,
              private photoViewer: PhotoViewer,
                private router:Router,
              private route : ActivatedRoute,
    public camera: Camera) {
  	  	this.route.queryParams.subscribe(params => {
	      if (this.router.getCurrentNavigation().extras.state) {
	      		 this.chat = this.router.getCurrentNavigation().extras.state;
             console.log(this.navData);
                 this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
                 console.log(this.userDetails);
		    this.messages.push({
		      datetime: this.chat.created,
		      message: this.chat.message,
		      receiver: this.userDetails.details.user_type == '1' ? 'true' : 'false',
		      msg_from: this.chat.parent_user_no,
		      msg_to: this.chat.school_id,
		      attachment_url: this.chat.message_image,
		      id: 0
		    });
		    this.getInitialChat();
		    this.chatInterval = setInterval(() => {
		      this.getChats(this.lastMessageId);
		    }, 5000);
	      }
	    });
      this.translate.get("alertmessages").subscribe((response) => {
        this.lang = response;
      })
  }

  /**
   * Ionic navigation event will run when page is loaded
   */
  ionViewWillEnter() {
  }
    showPhoto(url){
    this.photoViewer.show(url);
  }

  /**
   * Get the initial chat when user comes to this page
   */
  getInitialChat() {
    this.dataProvider.showLoading();
    let data = {
      user_no: this.userDetails.details.user_no,
      school_id: this.userDetails.details.school_id,
      user_type: this.userDetails.details.user_type,
      session_id: this.userDetails.session_id,
      chat_id: this.chat.id,
      last_msg_id: 0
    }
    this.dataProvider.getParentConnectChatMessages(data).then((response) => {
      this.dataProvider.hideLoading();
      if (response.session) {
        let length = response.chat.length;
        if (length > 0) {
          response.chat.forEach((message) => {
            this.messages.push(message)
          })
          this.lastMessageId = response.chat[length - 1].id;
          setTimeout(() => {
            if (this.contentArea) {
              this.contentArea.scrollToBottom(300);
            }
          });
        }
      } else {
       // this.authProvider.flushLocalStorage();
        this.dataProvider.errorALertMessage(response.message);
       this.router.navigate(['login'], { replaceUrl: true });
      }
    }).catch((error) => {
      this.dataProvider.hideLoading();
      // this.dataProvider.errorALertMessage(error);
    })
  }

  /**
   * Get the chat after the last message
   * @param lastMessageId Contains the last message id
   */
  getChats(lastMessageId) {
    let data = {
      user_no: this.userDetails.details.user_no,
      school_id: this.userDetails.details.school_id,
      user_type: this.userDetails.details.user_type,
      session_id: this.userDetails.session_id,
      chat_id: this.chat.id,
      last_msg_id: lastMessageId
    }
    this.dataProvider.getParentConnectChatMessages(data).then((response) => {
      if (response.session) {
        let length = response.chat.length;
        if (length > 0) {
          let msgLength = this.messages.length;
          response.chat.forEach((message) => {
            if (message.id < this.messages[msgLength - 1].id) {
              this.messages.push(message);
            } else {
              let msg = this.messages.filter((oldMsg) => {
                return oldMsg.id == message.id;
              })
              if (msg.length == 0) {
                this.messages.push(message);
              }
            }
          })
          setTimeout(() => {
            if (this.contentArea._scroll) {
              this.contentArea.scrollToBottom(10)
            }
          });
          this.lastMessageId = response.chat[length - 1].id;
        }
      } else {
       // this.authProvider.flushLocalStorage();
        this.dataProvider.errorALertMessage(response.message);
       this.router.navigate(['login'], { replaceUrl: true });
      }
    }).catch((error) => {
      // this.dataProvider.errorALertMessage(error);
      console.log(error);
    })
  }

  /**
   * Used to dismiss the modal opened for the chat
   */
  dismiss() {
    if (this.chatInterval) {
      clearInterval(this.chatInterval);
    }
    this._location.back();
    // this.viewCtrl.dismiss();
  }

  /**
   * Send the message to provider
   */
  sendMessage() {
    if ((this.message && this.message.trim() != '') || this.attachment != '') {
      if (this.message.length > 140) {
        this.dataProvider.showToast(this.lang.max_body)
      } else {
        this.image = '';
        this.dataProvider.showLoading();
        let data = {};
        if (this.userDetails.details.user_type == '4' || this.userDetails.details.user_type == '8') {
          data = {
            session_id: this.userDetails.session_id,
            user_no: this.userDetails.details.user_no,
            user_type: this.userDetails.details.user_type,
            chat_msg: {
              connect_id: this.chat.id,
              msg_from: this.userDetails.details.user_no,
              msg_to: this.userDetails.details.school_id,
              message: this.message,
              attachment_url: this.attachment
            }
          }
        } else if (this.userDetails.details.user_type == '1') {
          data = {
            session_id: this.userDetails.session_id,
            user_no: this.userDetails.details.user_no,
            user_type: this.userDetails.details.user_type,
            chat_msg: {
              connect_id: this.chat.id,
              msg_from: this.userDetails.details.school_id,
              msg_to: this.chat.parent_user_no,
              admin_user_no: this.userDetails.details.user_no,
              message: this.message,
              attachment_url: this.attachment
            }
          }
        }
        this.dataProvider.sendParentConnectChatMsg(data).then((response) => {
          this.dataProvider.hideLoading();
          if (response.session) {
            this.dataProvider.showToast(response.message);
            if (this.lastMessageId < response.msg_id) {
              if(response.attachment_url){
                this.messages.push({
                  receiver: 'false',
                  message: this.message,
                  id: response.msg_id,
                  attachment_url: response.attachment_url
                });
              }else{
                this.messages.push({
                  receiver: 'false',
                  message: this.message,
                  id: response.msg_id
                });
              }
              setTimeout(() => {
                if (this.contentArea._scroll) {
                  this.contentArea.scrollToBottom(10)
                }
              });
            }
            this.message = '';
            this.attachment = '';
          } else {
           // this.authProvider.flushLocalStorage();
            this.dataProvider.errorALertMessage(response.message);
           this.router.navigate(['login'], { replaceUrl: true });
          }
        }).catch((error) => {
          this.dataProvider.hideLoading();
          this.dataProvider.errorALertMessage(error);
        })
      }
    }
  }

  /**
   * alert to show image take choice
   */
 async takePicture(){
  const alert=await this.alertCtrl.create({
      header: this.lang.image_option,
      buttons: [
        {
          text: this.lang.camera,
          handler: ()=>{
            this.openCamera();
          }
        },
        {
          text: this.lang.gallery,
          handler: ()=>{
            this.openGallery()
          }
        }
      ]
    })
  await alert.present();
  }

  /**
   * mobile camera to take image 
   */
  openCamera(){
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.CAMERA,
      targetHeight: 500,
      targetWidth: 500
    }

    this.camera.getPicture(options).then((imageData)=>{
      if(imageData){
        this.attachment = "data:image/png;base64,"+imageData;
        this.image = 'data:image/jpeg;base64,'+imageData;
      }
    })
  }

  /**
   * Open gallery to take image
   */
  openGallery(){
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetHeight: 500,
      targetWidth: 500
    }

    this.camera.getPicture(options).then((imageData)=>{
      if(imageData){
        this.attachment = "data:image/png;base64,"+imageData;
        this.image = 'data:image/jpeg;base64,'+imageData;
      }
    })
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
