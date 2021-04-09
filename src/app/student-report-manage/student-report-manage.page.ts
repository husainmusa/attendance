import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, PopoverController,Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DatabaseService } from '../service/database/database.service';
import { StudentDataService } from '../service/student-data/student-data.service';
import { environment } from '../../environments/environment';
import { Storage } from '@ionic/storage';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';

const env = environment;

@Component({
  selector: 'app-student-report-manage',
  templateUrl: './student-report-manage.page.html',
  styleUrls: ['./student-report-manage.page.scss'],
})
export class StudentReportManagePage implements OnInit {
	navData:any={};
	lang:any;
	reportType:any;
	selectedDate:any;
	formData:any={
		reportType:'',
		selectedDate:'',
		selectedDays:'',
		note:''
	}
	userDetails:any={};
	exitdays:any=[];
	isExitToday:boolean=false;
	medical:any=[];
	suspend:any=[];
  constructor(public navCtrl: NavController,
			  			public dataProvider: DataService,
			  			public authProvider: AuthService,
			  			public dbProvider: DatabaseService,
			  			public studentService:StudentDataService,
			  			public alertController: AlertController,
			  			public translate: TranslateService,
			  			public alertCtrl: AlertController,
			  			public camera: Camera,
			  			public network: Network,
			  			private route : ActivatedRoute,
			  			private router:Router,
			  			private printer: Printer,
			  			public zone:NgZone,
			  			private popover:PopoverController,
			  			public platform: Platform,
			  			private storage: Storage) {

  	this.route.queryParams.subscribe(params => {
	        if(this.router.getCurrentNavigation().extras.state) {
    				this.navData = this.router.getCurrentNavigation().extras.state;
    				console.log(this.navData);
	        }
    });
    this.translate.get("alertmessages").subscribe((val)=>{
      this.lang = val;
    })
  }

  ngOnInit() {
		if (localStorage.getItem("userloggedin")) {
     		this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
     		this.getReports();
		}
  }
  
  submitForm(){
  	let date= new Date(this.formData.selectedDate);
  	this.formData.selectedDate=this.dataProvider.getFormatedDate(date);
  	this.formData.student_id=this.navData.student_id,
  	this.formData.course_id=this.navData.course_id,
  	this.formData.user_no= this.userDetails.details.user_no,
    this.formData.school_id= this.userDetails.details.school_id,
    this.formData.session_id= this.userDetails.session_id
  	console.log(this.formData);
    this.dataProvider.showLoading();
  	this.dataProvider.submitStudentReports(this.formData).then(data=>{
  		this.dataProvider.hideLoading();
      if(data){
        this.dataProvider.showToast(this.lang.report_generated);
        this.getReports(false);
  		}
  	}).catch(er=>{
      this.dataProvider.hideLoading();
      this.dataProvider.showToast(er);
  		console.log(er);
  	})
  }

  getReports(loader=true){
  	let data={
  		student_id:this.navData.student_id,
  		course_id:this.navData.course_id,
  		user_no: this.userDetails.details.user_no,
  		school_id: this.userDetails.details.school_id,
  		session_id: this.userDetails.session_id
  	}
  	if(loader)this.dataProvider.showLoading();

  	this.dataProvider.getStudentReports(data).then(res=>{
		  if(loader)this.dataProvider.hideLoading();
  		if(res.session){
  			if(res.data){
  				if(res.data.suspend.length){
					  this.suspend=res.data.suspend;
  				}else{
  					this.suspend=[];
  				}
  				if(res.data.exitdays.length){
  					this.exitdays=res.data.exitdays;
  					this.exitdays.forEach((d)=>{
  						let spl = d.date.split(' ');
  						d.date=spl[0];
  						d.time=spl[1]
  					})
  				}else{
  					this.exitdays=[];
  				}
  				if(res.data.medical.length){
					  this.medical=res.data.medical;
  				}else{
  					this.medical=[];
  				}
  				this.isExitToday=false;
  				if(res.data.exittoday && res.data.exittoday.length){
				    this.isExitToday=true;
  				}
  			}
  		}else{
  			this.authProvider.flushLocalStorage();
  			this.router.navigate(['login'],{replaceUrl:true});
  		}
  	}).catch(er=>{
  		if(loader)this.dataProvider.hideLoading();
  		console.log(er);
  	})
  }

  changeReportType(event){
  	if(event.detail.value== 'suspend'){
  		var tomorrow = new Date();
  		tomorrow.setDate(new Date().getDate()+1);
  		this.formData.selectedDate=this.dataProvider.getFormatedDate(tomorrow);
  	}else{
  		var today = new Date();
  		this.formData.selectedDate=this.dataProvider.getFormatedDate(today);
  	}
  }

  deleteReport(rid,reportType){
  	console.log(rid);

    let data={
      id:rid,
      reportType:reportType,
      student_id:this.navData.student_id,
      course_id:this.navData.course_id,
      user_no: this.userDetails.details.user_no,
      school_id: this.userDetails.details.school_id,
    }

    this.dataProvider.removeStudentReportByType(data).then(data=>{
      this.dataProvider.hideLoading();
      if(data){
        this.dataProvider.showToast(this.lang.report_deleted);
        this.getReports(false);
      }
    }).catch(er=>{
      this.dataProvider.hideLoading();
      this.dataProvider.showToast(er);
      console.log(er);
    })

  }

  printReport(){
    let data={
      student_id:this.navData.student_id,
      course_id:this.navData.course_id,
      user_no: this.userDetails.details.user_no,
      school_id: this.userDetails.details.school_id,
    }
    
    this.dataProvider.printAllReports(data).then(data=>{
      this.dataProvider.hideLoading();
      if(data){
        let options: PrintOptions = { orientation: 'portrait'};
        this.printer.print(data.data,options).then((onSuccess:any)=>{ 
        },(e:any)=>{
          console.log('printer.print',e)
          this.dataProvider.showToast(this.lang.report_error);
        });
      }
    }).catch(er=>{
      this.dataProvider.hideLoading();
      this.dataProvider.showToast(er);
      console.log(er);
    })
  }



 
}
