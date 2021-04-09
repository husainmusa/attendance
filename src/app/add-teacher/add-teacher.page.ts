import { Component, OnInit, Input,NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {CreateClassPage } from '../create-class/create-class.page';


@Component({
  selector: 'app-add-teacher',
  templateUrl: './add-teacher.page.html',
  styleUrls: ['./add-teacher.page.scss'],
})
export class AddTeacherPage implements OnInit {
	userDetails:any;
	teacherData:any={};
	validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
	lang:any={};
  constructor(public navCtrl: NavController, 
             // public app: App, 
              public translate: TranslateService,
              public dataProvider: DataService, 
              public authProvider: AuthService,  
              //public events: Events,
              public alertCtrl: AlertController, 
              private route : ActivatedRoute,
              public zone:NgZone,
              private router:Router,
              public modalController: ModalController) {

  	this.translate.get("alertmessages").subscribe((res)=>{
      this.lang = res;
    })
               }

  ngOnInit() {
  	if(localStorage.getItem("userloggedin")){
           // console.log('logged in');
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
    }
  }
  submit(){
  	console.log(this.teacherData);
  	if(this.validateForm()){
  		console.log('validateForm');
  		this.teacherData.email_id= this.teacherData.email_id || '';
  		this.teacherData.user_no= this.userDetails.details.user_no;
      	this.teacherData.school_id= this.userDetails.details.school_id;

      	this.dataProvider.showLoading();
      	this.dataProvider.registerTeacher(this.teacherData).then((res:any)=>{
	      this.dataProvider.hideLoading();
	      console.log('plan',res);
	      const navigation: NavigationExtras = {
              state :{
                isUpdated:true
              }
            };
          this.zone.run(() => {
            this.router.navigate(['manage-teacher'], navigation);
          });

	    }).catch(e=>{
	      this.dataProvider.showToast(e);
	      this.dataProvider.hideLoading();
	      console.log(e);
	    })
  	}
  }

  validateForm(){
  	if(this.teacherData.email_id && !this.teacherData.email_id.match(this.validRegex)){
  		this.dataProvider.showToast(this.lang.email_valid);
  		return false
  	}else if(!this.teacherData.first_name || this.teacherData.first_name==''){
  		this.dataProvider.showToast(this.lang.usename_required);
  		return false;
  	}else if(!this.teacherData.username || this.teacherData.username==''){
  		this.dataProvider.showToast(this.lang.user_id_required);
  		return false
  	}else if(!this.teacherData.password || this.teacherData.password==''){
  		this.dataProvider.showToast(this.lang.password_required);
  		return false;
  	}else if(!this.teacherData.confirm_password || (this.teacherData.confirm_password != this.teacherData.password)){
  		this.dataProvider.showToast(this.lang.confirm_password_required);
  		return false;
  	}else{
  		return true;
  	}
  }

}
