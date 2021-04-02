import { Component, OnInit } from '@angular/core';
import { NavigationExtras , Router, ActivatedRoute } from '@angular/router';  
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { PopoverController } from '@ionic/angular';
import {LoaderComponent} from '../components/loader/loader.component';
import { LoginModel } from '../model/login.model';
import { NavController, Platform } from '@ionic/angular';
import { Device } from '@ionic-native/device/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
@Component({
  selector: 'app-parent-register',
  templateUrl: './parent-register.page.html',
  styleUrls: ['./parent-register.page.scss'],
})
export class ParentRegisterPage implements OnInit {
	  parent:any = {};
	  user_no:any;
	  school_id:any;
    loggedinUser=<any>[];
    user:LoginModel = <LoginModel>{};
    popOver:any;
  constructor(public authProvider: AuthService,
              public dataProvider: DataService,
              private route : ActivatedRoute,
              private router:Router,
              public fcm: FCM,
              public device: Device,
              public popoverController: PopoverController,
              public platform: Platform, 
              public dbProvider: DatabaseService ) {
  				this.route.queryParams.subscribe(params => {
  					if (this.router.getCurrentNavigation().extras.state) {
  					  this.user_no = this.router.getCurrentNavigation().extras.state.un;
  					  this.school_id = this.router.getCurrentNavigation().extras.state.id;
					
					  	console.log('ionViewDidLoad RegisterparentPage');
					    console.log("user_no"+this.user_no);
					    console.log("school_id"+this.school_id);
  					}
     			});

              }

  ngOnInit() {
  }

    _keyPress(event: any) {
    var charCode = (event.which) ? event.which : event.keyCode
    if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
    return true;
  }
  ionViewWillEnter() {
    this.dbProvider.createTable();
    if(localStorage.getItem('earlyLogin')){
      this.loggedinUser=JSON.parse(localStorage.getItem("earlyLogin"));
      console.log(this.loggedinUser);
    }
    if(this.platform.is("cordova")){
      this.user.device_id = this.device.uuid;
      if(this.device.platform == 'android' || this.device.platform == 'Android'){
        this.user.os_type = 1;
      }else{
        this.user.os_type = 2;
      }
      this.fcm.getToken().then((token)=>{
        this.user.registration_id = token;
      })
    }
  }

  registerparent(){
    this.dataProvider.showLoading();
    this.dataProvider.registerNewParent({
      "user_no": this.user_no,
      "school_id": this.school_id,
      "parentId": this.parent.parentId,
      "parentName": this.parent.name,
      "studentId": this.parent.studentId,
      "studentName": this.parent.studentName,
      "password": this.parent.password
    }).then((response)=>{
      this.dataProvider.hideLoading();
      this.dataProvider.showToast(response);
      this.user.email_id = this.parent.parentId;
      this.user.password = this.parent.password;
     // this.navCtrl.pop();
     this.login();

    }).catch((err)=>{
      this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(err);
    })
  }

  login() {
    console.log('logindata',this.user);
    this.presentPopover();
    this.authProvider.doLogin(this.user).then((response)=>{
      this.dissmissPopOver();
      console.log('res',response);
      if(this.loggedinUser.length>0){
       let isexist=false;
       let index;
        for (let i = 0; i<this.loggedinUser.length; i++) {
          if(this.loggedinUser[i].email_id==this.user.email_id){
            isexist=true
            index=i;
          }
        }
        let img:any;
        if(response.details.is_school_admin==1){
          img=response.details.school_logo;
        }else{
          img=response.details.pic;
        }
        let data={
              name:response.details.first_name,
              email_id: this.user.email_id, 
              password: this.user.password,
              user_no:response.details.user_no,
              image:img
            }
        if (! isexist){
            this.loggedinUser.push(data);
          }else{
            this.loggedinUser[index]=data;
          }
         console.log('early Log',this.loggedinUser);
        localStorage.setItem("earlyLogin",JSON.stringify(this.loggedinUser));
      }else{
        let img:any;
        if(response.details.is_school_admin==1){
          img=response.details.school_logo;
        }else{
          img=response.details.pic;
        }
             let data={
                 name:response.details.first_name,
                  email_id: this.user.email_id, 
                  password: this.user.password,
                  user_no:response.details.user_no,
                  image:img
                }
            this.loggedinUser.push(data);
            console.log('early Log',this.loggedinUser);
            localStorage.setItem("earlyLogin",JSON.stringify(this.loggedinUser));
          }
            this.authProvider.publishEvent(true);
            this.authProvider.changeUser(true);
      if(response.details.user_type == '4'){
        this.router.navigate(['tabs/children'], { replaceUrl: true });
      }else if(response.details.user_type == '8'){
        this.router.navigate(['tabs/student-notes'], { replaceUrl: true });
      }else{
        this.router.navigate(['tabs'], { replaceUrl: true });

      }
    }).catch((error)=>{
      this.dissmissPopOver();
      this.dataProvider.errorALertMessage(error);
    })
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


}
