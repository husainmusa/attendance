import { Component, OnInit } from '@angular/core';
import { NavController, Platform,AlertController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { GeoServiceProvider } from '../service/geo-service/geo-service'
import { Storage } from '@ionic/storage';
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {

  user = {
    name: '',
    pic: '',
    username: '',
    email_id: '',
    phone_no: '',
    oldpass: '',
    newpass: '',
    parent_register_link:true,
    teacher_register_link:true,
    delay_rule:'',
    warning_report:'',
    warning_report_second:'',
    warning_report_third:'',
    school_details:'',
    country:''
  }
  displayPic:any = '';
  lang:any = {};
  userDetails:any = {}
  passwordType: string = 'password';
  passwordIcon: string = 'eye-off';
  passwordTypecnf: string = 'password';
  passwordIconcnf: string = 'eye-off';
  userType:any;
  schoolDetail:any={};
  is_school_admin:any;
  parent_link:any;
  teacherLink:any;
  countries:any=[];
  selectedCountyCode:any;
  countryDetails:any={};
  /**
   * Class list constructor
   * @param app   Root app 
   * @param dataProvider  Use for getting data from the API
   * @param authProvider  Use for authentication purpose
   * @param translate used for translation service
   * @param events App events 
   */
  constructor(public dataProvider: DataService, 
  			  public authProvider: AuthService, 
  			  public camera: Camera,
            //  public app: App,
          public translate: TranslateService, 
			    private router:Router,
          private storage: Storage,
            //  public events: Events,
          private geoService:GeoServiceProvider, 
          public alertCtrl: AlertController) {
    this.translate.get("alertmessages").subscribe((res)=>{
      this.lang = res;
    })
    this.getCountry();
  }

  ionViewWillEnter() {
    if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      console.log(this.userDetails);
      this.user.name = this.userDetails.details.first_name +' '+ this.userDetails.details.last_name
      this.user.username = this.userDetails.details.username;
      this.user.email_id = this.userDetails.details.email_id;
      this.user.phone_no = this.userDetails.details.phone_no;
      this.user.school_details = this.userDetails.details.school_details;
      this.user.country = this.userDetails.details.country_ar_name;
      this.selectedCountyCode = this.userDetails.details.country_code;
      if(this.userDetails.details.is_school_admin==1){
          console.log('vv',this.userDetails.details.is_school_admin);
          this.displayPic = this.userDetails.details.school_logo;
      }else{
        this.displayPic =   this.userDetails.details.pic;   
      }
      this.userType =   this.userDetails.details.user_type;
      this.is_school_admin =   this.userDetails.details.is_school_admin;
      if(this.userType==1){
        this.getAllRules();
      }
    }else{
      this.dataProvider.hideLoading();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
      //this.app.getRootNav().setRoot("LoginPage");
    }
  }
  getCountry(){
    this.storage.get('language').then(res=>{
     if(res=='en'){
      console.log(res);
       this.countries = this.geoService.getEnCountries();
     }else{
       this.countries = this.geoService.getArCountries();
     }
   })
  }
  assignCountry(){
    console.log(this.selectedCountyCode);
    this.countryDetails=this.geoService.getCountryDetails(this.selectedCountyCode);
    console.log(this.countryDetails);
  }
  /**
   * Show hidden password on frontend 
   */
  showpass() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off' ? 'eye' : 'eye-off';
  }

  /**
   * Show hidden confirm password on frontend 
   */
  showpasscnf() {
    this.passwordTypecnf = this.passwordTypecnf === 'text' ? 'password' : 'text';
    this.passwordIconcnf = this.passwordIconcnf === 'eye-off' ? 'eye' : 'eye-off';
  }
  getAllRules(){
    let data={
      school_id:this.userDetails.details.school_id,
      user_no:this.userDetails.details.user_no
    }
    this.dataProvider.getAllRules(data).then(res=>{
      if(res){
        this.schoolDetail=res.school_details;
        if(res.user_details.teacher_register_link=='1'){
          this.teacherLink=true;
        }else{
          this.teacherLink=false;
        }
        if(res.user_details.parent_register_link=='1'){
          this.parent_link=true;
        }else{
          this.parent_link=false;
        }
        // this.teacherLink=res.user_details.teacher_register_link;
        // this.parent_link=res.user_details.parent_register_link;
        console.log(this.teacherLink,this.parent_link);
        this.user.delay_rule=this.schoolDetail.delay_rule;
        this.user.warning_report=this.schoolDetail.report_condition;
        this.user.warning_report_second=this.schoolDetail.second_report_condition;
        this.user.warning_report_third=this.schoolDetail.third_report_condition;
      }
      console.log('res',res)
    }).catch(error=>{
      console.log(error);
    })
  }

  /**
   * Update the user details
   */
  update(){
    if(this.user.oldpass != '' && this.user.newpass == ''){
      this.dataProvider.showToast(this.lang.new_pass_required);
    }else if(this.user.oldpass == '' && this.user.newpass != ''){
      this.dataProvider.showToast(this.lang.old_pass_required);
    }else{
      let data:any = {
        user_no: this.userDetails.details.user_no,
        session_id: this.userDetails.session_id,
        users: {
          email_id: this.user.email_id,
          phone_no: this.user.phone_no,
          oldpass: this.user.oldpass,
          newpass: this.user.newpass
        },
        parent_register_link:this.user.parent_register_link,
        teacher_register_link:this.user.teacher_register_link,
        delay_rule:this.user.delay_rule,
        warning_report:this.user.warning_report,
        warning_report_second:this.user.warning_report_second,
        warning_report_third:this.user.warning_report_third,
        pic: this.user.pic
      }
      if(this.selectedCountyCode){
        data.country_en_name=this.countryDetails.country_en_name;
        data.country_code=this.countryDetails.country_code;
        data.country_ar_name=this.countryDetails.country_ar_name;
      }
      console.log(data);

      this.dataProvider.showLoading();
      this.dataProvider.updateUserSettings(data).then((response)=>{
        this.dataProvider.hideLoading();
        if(response.session){
          console.log(response);
          this.dataProvider.showToast(response.message);
          if(this.selectedCountyCode){
            this.userDetails.details.country_en_name=this.countryDetails.country_en_name;
            this.userDetails.details.country_code=this.countryDetails.country_code;
            this.userDetails.details.country_ar_name=this.countryDetails.country_ar_name;
          }
          this.userDetails.details.email_id = this.user.email_id;
          this.userDetails.details.phone_no = this.user.phone_no;
          if(this.userDetails.details.is_school_admin==1){
            this.dataProvider.language.emit('ar');
            console.log('here');
            this.userDetails.details.school_logo = (response.pic != '') ? response.pic : this.displayPic;
          }else{
            this.userDetails.details.pic = response.pic != '' ? response.pic : this.displayPic;
          }
          localStorage.setItem("userloggedin", JSON.stringify(this.userDetails));
          
            if(localStorage.getItem('earlyLogin')){
             let loggedinUser=JSON.parse(localStorage.getItem("earlyLogin"));
              console.log(loggedinUser);
             for (var i =0;  i < loggedinUser.length; i++) {
               if(loggedinUser[i].name == this.userDetails.details.first_name){
               console.log(loggedinUser[i].name,this.user.name,this.user.newpass);
                 if(this.user.newpass !=''){
                   loggedinUser[i].password=this.user.newpass;
                 }
                if(this.userDetails.details.is_school_admin==1){
                    console.log('loggedinUser[i]',this.userDetails.details.school_logo);
                   loggedinUser[i].image=this.userDetails.details.school_logo;
                }else{
                   loggedinUser[i].image=this.userDetails.details.pic;                 
                }
             }
            }
            localStorage.setItem("earlyLogin",JSON.stringify(loggedinUser));
          }
          this.authProvider.publishEvent( true);
        }else{
          this.authProvider.flushLocalStorage();
          this.dataProvider.errorALertMessage(response.message);
          this.router.navigate(['login'], { replaceUrl: true });
          //this.app.getRootNav().setRoot("LoginPage");
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
 async takePicture() {
  const alert= await this.alertCtrl.create({
      header: this.lang.image_option,
      buttons: [
        {
          text: this.lang.camera,
          handler: () => {
            this.openCamera();
          }
        },
        {
          text: this.lang.gallery,
          handler: () => {
            this.openGallery()
          }
        }
      ]
    })
  await alert.present()
  }

  /**
   * mobile camera to take image 
   */
  openCamera() {
    let options: CameraOptions = {
      quality: 79,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA
    }

    this.camera.getPicture(options).then((imageData) => {
      if (imageData) {
        console.log(imageData);
        this.displayPic = 'data:image/png;base64,'+imageData;
        this.user.pic = 'data:image/png;base64,'+imageData;
      }
    })
  }

  /**
   * Open gallery to take image
   */
  openGallery() {
    let options: CameraOptions = {
      quality: 79,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }

    this.camera.getPicture(options).then((imageData) => {
      if (imageData) {
        console.log(imageData);
        this.displayPic = 'data:image/png;base64,'+imageData;
        this.user.pic = 'data:image/png;base64,'+imageData;
      }
    })
  }

  ngOnInit() {
  }

}
