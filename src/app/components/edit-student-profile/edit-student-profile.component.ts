import { Component, OnInit, Input,NgZone } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { NavController, Platform } from '@ionic/angular';
import { AuthService } from '../../service/auth/auth.service';
import { DatabaseService } from '../../service/database/database.service';
import { LoginModel } from '../../model/login.model';
import { Device } from '@ionic-native/device/ngx';
import { FCM } from '@ionic-native/fcm/ngx';
//import { DataProvider } from '../../providers/data/data';
//import { TabsPage } from '../tabs/tabs';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
//import { DatabaseProvider } from '../../providers/database/database';


@Component({
  selector: 'app-edit-student-profile',
  templateUrl: './edit-student-profile.component.html',
  styleUrls: ['./edit-student-profile.component.scss'],
})
export class EditStudentProfileComponent implements OnInit {
	@Input()student:any;
	@Input()classes:any;
	loggedinUser:any;
	userDetails:any;
	currentUser:any;
	studentName:any;
	studentSemester:any;
	user:{
		'email_id':'',
		'password':''
	}
  currentUserEmail:any;
  constructor(public popoverController: PopoverController,
  			  public navCtrl: NavController, 
  	          public device: Device, 
  	          public authProvider: AuthService,
              public platform: Platform, 
               public fcm: FCM,
              // public events: Events, 
              public translate: TranslateService, 
              private route : ActivatedRoute,
              public zone:NgZone,
              private router:Router,
              public dbProvider: DatabaseService) { }

  ngOnInit() {
  	this.studentName=this.student.name;
  	this.classes.forEach(res=>{
  		if(res.name==this.student.course_name){
  		this.studentSemester=res.cid;	
  		}
  	})
  //	console.log(this.student,this.classes,this.studentSemester,this.studentName);
    if(localStorage.getItem("userloggedin")){
     // console.log('logged in');
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.currentUser=this.userDetails.details.username;
      this.currentUserEmail=this.userDetails.details.email_id;
     // console.log('th',this.currentUser);
    }
  	if(localStorage.getItem('earlyLogin')){
      this.loggedinUser=JSON.parse(localStorage.getItem("earlyLogin"));
     // console.log(this.loggedinUser);
    }
  }
  closeModal(){
  	this.popoverController.dismiss();
  }

  saveChanges(){
  	const inputElement = document.getElementById("input") as HTMLInputElement;
  	let i=inputElement.value;
  	const select = document.getElementById("select") as HTMLInputElement;
  	let s=select.value;
  	let data={
  		student:this.student,
  		studentName:i,
  		studentSemester:s
  	}
  //	console.log(data);
  	this.popoverController.dismiss(data);
  }

  deleteClass(){
  	let data={
  		student:this.student,
  		deleteClass:true
  	}
  	this.popoverController.dismiss(data)
  }

}
