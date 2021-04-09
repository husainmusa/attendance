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
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';

@Component({
  selector: 'app-followup-add-fields',
  templateUrl: './followup-add-fields.page.html',
  styleUrls: ['./followup-add-fields.page.scss'],
})
export class FollowupAddFieldsPage implements OnInit {
  userDetails:any={};
  lang:any={};
  fields:Array<any>=[];
  navData:any;
  constructor(public navCtrl: NavController, 
	  		  	public dataProvider: DataService,
	  		    public authProvider: AuthService, 
	  		    public translate: TranslateService,
	  		    public alertCtrl: AlertController, 
	  		    public camera: Camera, 
	  		    public network: Network,
	            private route : ActivatedRoute,
	            private router:Router,
	            private printer: Printer,
	            public zone:NgZone, 
		        public platform: Platform) {
	  	this.translate.get("alertmessages").subscribe((response) => {
				    this.lang = response;
	    })
	    this.route.queryParams.subscribe(params => {
			if (this.router.getCurrentNavigation().extras.state) {
				this.navData = this.router.getCurrentNavigation().extras.state;
			}
	    });

  }

  ngOnInit() {
  	if (localStorage.getItem("userloggedin")) {
			this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
				this.getFields();
	}
  }

  addExtraFields(){
  	this.zone.run(()=>{
	  	this.fields.push({field_name:'',field_max_marks:'',marks_on_present:'',absent_marks:false});
	  	console.log(this.fields);
  	})
  }
  removeField(index,field){
  	if(field.id){
  		let data = {
  				"user_no": this.userDetails.details.user_no,
	        	"session_id": this.userDetails.session_id,
		        "id": field.id
		}
		this.dataProvider.deleteFollowupFields(data).then(res => {
	        if(res.data){
        		console.log('here',res.data)
  				this.fields.splice(index,1);
  				if(this.fields.length < 1){
  					const navigation: NavigationExtras = {
				      state : {
				        update:true,
				        course:this.navData.course
				      }
				    };
				    this.zone.run(() => {
				      this.router.navigate(['followup-student-list'], navigation);
				    });
  				}
        	}
	    },error=>{
	      // this.dataProvider.showToast(this.lang.field_remove_error);
	    })
  	}else{
  		this.fields.splice(index,1);
  	}
  }

  getFields(){
  	let course = this.navData;
  	let data = {
	        "user_no": this.userDetails.details.user_no,
	        "session_id": this.userDetails.session_id,
	        "course_id": course.course_id,
	        "school_id": this.userDetails.details.school_id
	}
	this.dataProvider.getFollowupFields(data).then(res => {
	        if(res.data){
	        	let fields=[];
	        	if(res.data.length){
	        		res.data.forEach((d)=>{
	        			d.absent_marks= +d.absent_marks;
	        		})
	        	}
	        	this.fields=res.data || [];
	        	console.log('here',this.fields,res.data)
	        }
    },error=>{
      this.dataProvider.hideLoading();
      this.dataProvider.showToast(this.lang.field_error);
    })

  }

  submitFields(){
  	if(this.checkField()){
	  	console.log(this.fields);
	  	let course = this.navData;
	      let data = {
	        "field": this.fields,
	        "user_no": this.userDetails.details.user_no,
	        "session_id": this.userDetails.session_id,
	        "course_id": course.course_id,
	        "school_id": this.userDetails.details.school_id
	      }

	      this.dataProvider.showLoading();
	      this.dataProvider.saveFollowupFields(data).then(res => {
	        this.dataProvider.hideLoading();
	        if(res.data){
	        	console.log('resp',res);
	        	const navigation: NavigationExtras = {
			      state : {
			        update:true,
			        course:this.navData.course
			      }
			    };
			    this.zone.run(() => {
			      this.router.navigate(['followup-student-list'], navigation);
			    });
	        }else{
	      		this.dataProvider.showToast(this.lang.field_error);
	        }
	    },error=>{
	      this.dataProvider.hideLoading();
	      this.dataProvider.showToast(this.lang.field_error);
	    })
  	}
  }

  checkField(){
  	let responce=true;
  	if(this.fields.length){
  		this.fields.forEach((field)=>{
  			field.absent_marks= (field.absent_marks == true)? 1:0;
  			if(!field.field_name || field.field_name == '' || field.field_name.length<1){
  				responce=false;
  				this.dataProvider.showToast(this.lang.field_name_required);
  				return false;
  			} else if(!field.field_max_marks || field.field_max_marks == '' ||field.field_name.length<1){
  				responce=false;
  				this.dataProvider.showToast(this.lang.field_max_marks_required);
  				return false;
  				
  			}
  		})
  		return responce;
  	}else{
  		return false;
  	}
  }

}
