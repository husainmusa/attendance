import { Component, OnInit } from '@angular/core';
import { NavController, Platform,AlertController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { LocationService } from '../service/location/location.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router} from '@angular/router';
import {GeoServiceProvider} from '../service/geo-service/geo-service';

@Component({
  selector: 'app-school-registration',
  templateUrl: './school-registration.page.html',
  styleUrls: ['./school-registration.page.scss'],
})
export class SchoolRegistrationPage implements OnInit {
  school: any = {};
  school_logo: any = './assets/imgs/logo.png';
  school_image:any = '';
  lang: any = {};
  getDelayRules;
  location:any;
  countryCode:any;
  countryName:any;

  constructor(public navCtrl: NavController,
              public camera: Camera,
              public alertCtrl: AlertController,
              public translate: TranslateService,
              private geo:GeoServiceProvider,
              public dataProvider: DataService,
              public authProvider: AuthService,
              public locationSrevice:LocationService,
              private router: Router) {
    this.translate.get("alertmessages").subscribe((res) => {
      this.lang = res;
    })
  }

  ngOnInit() {
  }
   ionViewWillEnter(){
    this.getLocation();
  }

  getDelayRule(){
    return Array(20);
  }
  getLocation(){
    console.log('call');
    // this.locationSrevice.checkGPSPermission(resp=>{
    //   this.location=resp;
    //   console.log('page',this.location);
    //   this.countryName=resp.countryName;
    //   this.countryCode=resp.countryCode;
    // },e=>{
    //   console.log(e);
    // })
    this.geo.getMyLocation().then(resp=>{
      console.log(resp.countrycode);
      if(resp!=''){
        this.location=resp;
         console.log('page',this.location);
         this.countryName=resp.countryname;
         this.countryCode=resp.countrycode;
      }else{
        console.log(resp);
      }
    })
  }


  /**
   * alert to show image take choice
   */
  async takePicture(imageType) {
   const alert = await this.alertCtrl.create({
      header: this.lang.image_option,
      buttons: [
        {
          text: this.lang.camera,
          handler: () => {
            this.openCamera(imageType);
          }
        },
        {
          text: this.lang.gallery,
          handler: () => {
            this.openGallery(imageType)
          }
        }
      ]
    })
   await alert.present();
  }

  /**
   * mobile camera to take image
   */
  openCamera(imageType) {
    let options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.CAMERA,
      targetHeight: 500,
      targetWidth: 500
    }

    this.camera.getPicture(options).then((imageData) => {
      if (imageData) {
        if(imageType == 'schoollogo'){
          this.school.school_logo = 'data:image/png;base64,'+imageData;
          this.school_logo = 'data:image/png;base64,'+imageData;
        }else{
          this.school.school_image = 'data:image/png;base64,'+imageData;
          this.school_image = 'data:image/png;base64,'+imageData;
        }
      }
    })
  }

  /**
   * Open gallery to take image
   */
  openGallery(imageType) {
    let options: CameraOptions = {
      quality: 75,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetHeight: 500,
      targetWidth: 500
    }

    this.camera.getPicture(options).then((imageData) => {
	      if (imageData) {
	        if(imageType == 'schoollogo'){
	          this.school.school_logo = 'data:image/png;base64,'+imageData;
	          this.school_logo = 'data:image/png;base64,'+imageData;
	        }else{
	          this.school.school_image = 'data:image/png;base64,'+imageData;
	          this.school_image = 'data:image/png;base64,'+imageData;
	        }
	      }
	    })
	  }

  /**
   * Register school
   */
  async registerSchool(){
    this.dataProvider.showLoading();
    this.school.country_code=this.countryCode;
    this.authProvider.registerSchool(this.school).then((response)=>{
      this.dataProvider.hideLoading();
     this.presentAlert(response);
    }).catch((err)=>{
      this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(err);
    })
  }

 async presentAlert(response){
  	 const alert = await this.dataProvider.alertCtrl.create({
        header: "Message",
        message: response,
        buttons: [{
          text: 'Ok',
          handler: ()=>{
            this.navCtrl.pop();
          }
        }]
      })
     await alert.present();
  }

}
