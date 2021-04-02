import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { CalendarComponentOptions } from 'ion2-calendar';


@Component({
  selector: 'app-edit-teacher-profile',
  templateUrl: './edit-teacher-profile.page.html',
  styleUrls: ['./edit-teacher-profile.page.scss'],
})
export class EditTeacherProfilePage implements OnInit {
	navData:any;
	lang:any;
	userDetails:any;
	teacher:any={};
  classes:any=[];
  constructor(public navCtrl: NavController,
		  	public dataProvider: DataService,
		    public authProvider: AuthService,
		    public translate: TranslateService,
		    public alertCtrl: AlertController, 
		    public camera: Camera, 
		    public network: Network,
        private route : ActivatedRoute,
        private router:Router,
        public zone:NgZone, 
		    public platform: Platform) {
  		this.route.queryParams.subscribe(params => {
	      if (this.router.getCurrentNavigation().extras.state) {
	      		 this.navData = this.router.getCurrentNavigation().extras.state.teacher;
            console.log(this.navData);
            this.teacher.email=this.navData.email_id;
            this.teacher.name=this.navData.first_name;
            this.teacher.user_id=this.navData.username;
            this.teacher.user_type=this.navData.user_type;
            this.teacher.class=this.navData.in_class;
            this.teacher.teacher_type=this.navData.assigned_as;
            if(this.navData.TeacherAttenEditPower !=='0'){
              this.teacher.attendence_permit=true
            }
            this.teacher.time=this.navData.editTimeForTeacher
            this.teacher.action='active'
	      }
	    });
    this.translate.get("alertmessages").subscribe((response) => {
      this.lang = response;
    })

  }

  ngOnInit() {
  }
  ionViewWillEnter(){
  	if (localStorage.getItem("userloggedin")) {
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.getClasses();
  	}
  }
  check(){
  	console.log(this.teacher.attendence_permit);
  }
  saveTeacherProfile(){
  	if(this.teacher.password !== this.teacher.c_pass){
  		this.dataProvider.showToast(this.lang.pass_not_match);
  	}else{
  		this.teacher.user_no=this.navData.user_no;
  		this.teacher.school_id=this.navData.school_id;
      this.teacher.updatedBy=this.userDetails.details.user_no;
  		console.log('teacher',this.teacher);
      if(this.teacher.attendence_permit==true){
        this.teacher.attendence_permit=1
      }else{
        this.teacher.attendence_permit=0
      }
  		this.dataProvider.updateTeacherProfile(this.teacher,res=>{

        const navigation: NavigationExtras = {
            state :{
              isUpdated:true
            }
          };
        console.log(navigation);
        this.zone.run(() => {
          this.router.navigate(['manage-teacher'], navigation);
        });
  		})
  	}
  }
  async deleteTeacher(){
     const alert= await this.alertCtrl.create({
      header: this.lang.delete_teacher,
      backdropDismiss: true,
      mode:'ios',
      buttons: [
        {
          text: this.lang.delete,
          handler: ()=>{
               let deleteData={
                 teacher_user_no:this.navData.user_no,
                 user_no: this.userDetails.details.user_no,
                 school_id: this.userDetails.details.school_id,
                 session_id: this.userDetails.session_id
               }
               this.dataProvider.deleteTeacher(deleteData,res=>{
                   // callback(res);
                   const navigation: NavigationExtras = {
                      state :{
                        isUpdated:true
                      }
                      
                    };
                  this.zone.run(() => {
                    this.router.navigate(['manage-teacher'], navigation);
                  });
                   console.log(res);
                 });

              }
        },
        {
          text: this.lang.alert_btn_cancel_text,
          handler: ()=>{
             

          }
        }
      ]
    })
   await alert.present();
  }
    getClasses(){
    let data = {
      "user_no": this.userDetails.details.user_no,
      "school_id": this.userDetails.details.school_id,
      "session_id": this.userDetails.session_id
    };
    this.dataProvider.showLoading();
    this.dataProvider.getCourses(data).then(response=>{
     this.dataProvider.hideLoading();
      if(response.session){
        this.classes=response.data;
      }
    }).catch(error =>{
     this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(error);
    })
  }
  portChange(event){
    console.log(event);
    this.teacher.class=event.value;
  }

}
