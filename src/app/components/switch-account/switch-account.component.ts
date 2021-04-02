import { Component, OnInit, Input,NgZone } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { NavController,AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../../service/auth/auth.service';
import { DatabaseService } from '../../service/database/database.service';
import { LoginModel } from '../../model/login.model';
import { Device } from '@ionic-native/device/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
import { Storage } from '@ionic/storage';
//import { DataProvider } from '../../providers/data/data';
//import { TabsPage } from '../tabs/tabs';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {LoaderComponent} from '../../components/loader/loader.component';
//import { DatabaseProvider } from '../../providers/database/database';


@Component({
  selector: 'app-switch-account',
  templateUrl: './switch-account.component.html',
  styleUrls: ['./switch-account.component.scss'],
})
export class SwitchAccountComponent implements OnInit {
  @Input() lang;
	loggedinUser:any;
	userDetails:any;
	currentUser:any;
  popOver:any;
	user:{
		'email_id':'',
		'password':''
	}
  currentUserEmail:any;
  fcm_Token:any;
  device_id:any;
  os_type:any;
  constructor(public popoverController: PopoverController,
  			  public navCtrl: NavController, 
  	          public device: Device, 
  	          public authProvider: AuthService,
              public platform: Platform, 
               public fcm: FCM,
               private alertController:AlertController,
              // public events: Events, 
              public translate: TranslateService, 
              private route : ActivatedRoute,
              public zone:NgZone,
              private router:Router,
              public dbProvider: DatabaseService,
              private storage: Storage) { }

  ngOnInit() {
    console.log(this.lang)
    this.fcm.getToken().then((token)=>{
        this.fcm_Token = token;
    })
    if(this.platform.is("cordova")){
      this.device_id = this.device.uuid;
      if(this.device.platform == 'android' || this.device.platform == 'Android'){
        this.os_type = 1;
      }else{
        this.os_type = 2;
      }
    }
    if(localStorage.getItem("userloggedin")){
     // console.log('logged in');
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.currentUser=this.userDetails.details.username;
      this.currentUserEmail=this.userDetails.details.email_id;
      console.log('th',this.currentUser);
    }
  	if(localStorage.getItem('earlyLogin')){
      this.loggedinUser=JSON.parse(localStorage.getItem("earlyLogin"));
      console.log(this.loggedinUser);
    }
  }

  removeUser(i){
    this.warnRemove(res=>{
    	this.loggedinUser.splice(i,1);
    	 localStorage.setItem("earlyLogin",JSON.stringify(this.loggedinUser));
    },e=>{

    })
  }

  async warnRemove( callBack:any,error:any){
     const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: this.lang.confirm,
      message: this.lang.alert_mssg,
      buttons: [
        {
          text: this.lang.cancel,
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
            error(false);
          }
        }, {
          text: this.lang.okay,
          handler: () => {
            console.log('Confirm Okay');
            callBack(true);
          }
        }
      ]
    });

    await alert.present();
  }

  closeModal(){
  	this.popoverController.dismiss();
  }
  loginOldUser(users:any){
      console.log(users);
      this.flushLocalStorage();
      setTimeout(res=>{
        this.login(users);
      },100)
  }
  registerSchol(){
  	this.router.navigate(['school-registration']);
  	this.closeModal();
  }
  addNewAccount(){
    let data = {
      "user_no": this.userDetails.details.userDetail,
      "session_id": this.userDetails.session_id
    }
    this.presentPopover('');
    // this.dataProvider.showLoading(data);
    this.authProvider.doLogout(data,'here').then(res=>{
      this.dismissPopover();
  	  this.router.navigate(['login']);
    }).catch(e=>{
      this.dismissPopover();
    })
  	this.closeModal();
  }
  flushLocalStorage() {
    localStorage.removeItem("userloggedin");
    this.dbProvider.deleteDataBase();
    localStorage.removeItem("attendance")
    this.storage.clear();
  }

    login(users) {
      this.closeModal();
      this.presentPopover('');
    console.log('logindata',this.user);
  //  this.dataProvider.showLoading(); 
      users.device_id=this.device_id;
      users.os_type=this.os_type;
      users.registration_id=this.fcm_Token;
    this.authProvider.doLogin(users).then((response)=>{
      this.dismissPopover();
    //  this.dataProvider.hideLoading();
      // this.events.publish("loggedin", true);
      console.log('res',response);
      this.authProvider.publishEvent(true);
      this.authProvider.changeUser(true);
      if(response.details.user_type == '4'){
        this.router.navigate(['tabs/children'], { replaceUrl: true });
       // this.navCtrl.setRoot("ChildrenPage");
      }else if(response.details.user_type == '8'){
        this.router.navigate(['tabs/student-notes'], { replaceUrl: true });
        //this.navCtrl.setRoot(TabsPage);
      }else{
        this.router.navigate(['tabs'], { replaceUrl: true });

      }
    }).catch((error)=>{
      this.dismissPopover();
  //    this.dataProvider.hideLoading();
     // this.dataProvider.errorALertMessage(error);
      this.router.navigate(['login'], { replaceUrl: true });
    })
  }
    async presentPopover(ev:any) {
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
    // setTimeout(res=>{
    //       this.popOver.dismiss();
    // },2500)
  }
  dismissPopover(){
    if(this.popOver)this.popOver.dismiss();
  }

} 
