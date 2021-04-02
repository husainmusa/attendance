import { Component, OnInit } from '@angular/core';
import { NavController, Platform,AlertController,ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-connect-new-message',
  templateUrl: './connect-new-message.page.html',
  styleUrls: ['./connect-new-message.page.scss'],
})
export class ConnectNewMessagePage implements OnInit {
userDetails:any = {};
  message:any = {
    title: '',
    message: '',
    ticketImage: ''  
  }
  ticketImage:string = '';
  lang:any = {};
  /**
   * Class list constructor
   * @param navCtrl Use for navigation between pages
   * @param app   Root app 
   * @param dataProvider  Use for getting data from the API
   * @param authProvider  Use for authentication purpose
   * @param viewCtrl View controller 
   */
  constructor(public navCtrl: NavController, 
  			      public viewCtrl: ModalController,
              public dataProvider: DataService, 
              public authProvider: AuthService, 
              public translate: TranslateService, 
              public camera: Camera, 
              public alertCtrl: AlertController,
              private router:Router,) {
              this.translate.get("alertmessages").subscribe((res)=>{
                this.lang = res;
              })
  }

  /**
   * Ionic navigation event will run when page is loaded
   */
  ionViewWillEnter() {
    this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
  }

  /**
   * For dismissing the modal
   */
  dismiss() {
    this.viewCtrl.dismiss();
  }
  
  /**
   * Send message to provider
   */
  sendMessage(){
    if(this.message.title.length > 35){
      this.dataProvider.showToast(this.lang.max_title);
    }else if(this.message.message.length > 140){
      this.dataProvider.showToast(this.lang.max_body);
    }else{
      this.dataProvider.showLoading();
      let data = {
        user_no: this.userDetails.details.user_no,
        school_id: this.userDetails.details.school_id,
        session_id: this.userDetails.session_id,
        message: this.message
      }
      this.dataProvider.createParentConnectChat(data).then((response)=>{
        this.dataProvider.hideLoading();
        if(response.session){
          this.dataProvider.showToast(response.message);
          this.viewCtrl.dismiss(true);
        }else{
          this.authProvider.flushLocalStorage();
          this.dataProvider.errorALertMessage(response.message);
          // this.app.getRootNav().setRoot("LoginPage");
          this.viewCtrl.dismiss(true);
          this.router.navigate(['login'], { replaceUrl: true });
        }
      }).catch(error =>{
        this.dataProvider.hideLoading();
        this.dataProvider.errorALertMessage(error);
      })
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
        this.message.ticketImage = "data:image/png;base64,"+imageData;
        this.ticketImage = "data:image/png;base64,"+imageData;
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
        this.message.ticketImage = "data:image/png;base64,"+imageData;
        this.ticketImage = "data:image/png;base64,"+imageData;
      }
    })
  }

  ngOnInit() {
  }

}
