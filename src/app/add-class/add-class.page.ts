import { Component, OnInit,NgZone,Input } from '@angular/core'; 
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DataService } from '../service/data/data.service';

@Component({
  selector: 'app-add-class',
  templateUrl: './add-class.page.html',
  styleUrls: ['./add-class.page.scss'],
})
export class AddClassPage implements OnInit {
	userDetails:any={};
	lang:any;
	classes:any=[];
	chnagedData=[];
    constructor(public navCtrl: NavController, 
				public dataProvider: DataService,
				public translate: TranslateService,
				public alertCtrl: AlertController, 
				private route : ActivatedRoute,
				private router:Router,
				public zone:NgZone,
				public platform: Platform) { 

    			this.translate.get("alertmessages").subscribe((response) => {
			      this.lang = response;
			    });
    }

    ngOnInit() {
  	 	if(localStorage.getItem("userloggedin")){
	      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
	      this.getClasses();
	  	}
    }

    getClasses(){
		let data = {
		  "user_no": this.userDetails.details.user_no,
		  "school_id": this.userDetails.details.school_id,
		  "session_id": this.userDetails.session_id
		};
		this.dataProvider.showLoading();
		this.dataProvider.getTeachersClass(data).then(res => {
			this.dataProvider.hideLoading();
		    if(res.data){
		      this.classes=res.data;
		    }
		}).catch(error=>{
			this.dataProvider.hideLoading();
			this.dataProvider.showToast(this.lang.usnexpectedError);
			console.log(error)
		})
    }

    changeClass(course, eve){
    	let isPresent=false;
    	let ind:any;
    	let selectedCourse={
    		'cid':course.courses.cid,
		  	"status":eve.detail.checked
    	};
    	for (let i = 0; i < this.chnagedData.length; i++) {
	      if(this.chnagedData[i]['cid']==selectedCourse.cid){
	        isPresent=true;
	        ind=i;
	      }
	    }
	    if(isPresent){
	    	this.chnagedData.splice(ind,1);
	    }else{
	    	this.chnagedData.push(selectedCourse);
	    }
	    // console.log(this.chnagedData);
    }

    setClasses(){
    	let data = {
		  "user_no": this.userDetails.details.user_no,
		  "school_id": this.userDetails.details.school_id,
		  "session_id": this.userDetails.session_id,
		  "updates":this.chnagedData
		};
		this.dataProvider.showLoading();
		this.dataProvider.setTeachersClass(data).then(res => {
			this.dataProvider.showToast(this.lang.class_added);
			this.dataProvider.hideLoading();
			const navigation: NavigationExtras = {
              state :{
                isUpdated:true
              }
	              
	            };
	          this.zone.run(() => {
	            this.router.navigate(['tabs/follow-up-student'], navigation);
	          });
		}).catch(error=>{
			this.dataProvider.hideLoading();
			this.dataProvider.showToast(this.lang.usnexpectedError);
			console.log(error)
		})
    }

}
 