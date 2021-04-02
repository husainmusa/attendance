import { Component, OnInit,NgZone,ViewChild  } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {CreateClassPage } from '../create-class/create-class.page';
import { PopoverController } from '@ionic/angular';
import {LoaderComponent} from '../components/loader/loader.component';
import { IonReorderGroup } from '@ionic/angular';
import { ItemReorderEventDetail } from '@ionic/core';

@Component({
  selector: 'app-follow-up-student',
  templateUrl: './follow-up-student.page.html',
  styleUrls: ['./follow-up-student.page.scss'],
})
export class FollowUpStudentPage implements OnInit {
  classes:Array<any> = [];
  noDataFound:string = "";
  userType:any;
  editMode:boolean = false;
  lang:any = {};
  userDetails:any = {};
  category:any;
  classBackgroundColor = ["#ff7043", "#2962ff", "#43a047", "#6d4c41", "#ffab00", "#00b0ff", "#651fff", "#2962ff", "#d81b60", "#6a1b9a"]
  dashBoard:any;
  popOver:any;
  canPresentPopover=false;

	constructor(public navCtrl: NavController,
	            public translate: TranslateService,
				public dataProvider: DataService,
				public authProvider: AuthService,
				public alertCtrl: AlertController,
				private route : ActivatedRoute,
				public popoverController: PopoverController,
				public zone:NgZone,
				private router:Router,
				public modalCtrl: ModalController) { 
				this.route.queryParams.subscribe(params => {
			      if (this.router.getCurrentNavigation().extras.state) {
			      		this.ionViewWillEnter(false);
			      }
			    });
				
				
	}


	ngOnInit() {
	}

	ionViewWillEnter(loader:boolean=true){
		this.translate.get("alertmessages").subscribe((res)=>{
		  this.lang = res;
		  if(localStorage.getItem("userloggedin")){
		      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
		      this.userType = this.userDetails.details.user_type;
		      this.getCourse(loader);
		    }else{
		      this.dataProvider.hideLoading();
		      this.authProvider.flushLocalStorage();
		      this.router.navigate(['login'], { replaceUrl: true });
		    }
		})
	}

	async presentPopover() {
		this.popOver = await this.popoverController.create({
			component: LoaderComponent,
			backdropDismiss:true,
			translucent: false,
			cssClass:'loaderStyle',
		});
		return this.popOver.present();
	}

	dissmissPopOver(){
	 setTimeout(()=>{
	   this.popOver.dismiss();
	 },500);
	}

	doRefresh(event) {
		this.ionViewWillEnter(false);
		setTimeout(() => {
		  event.target.complete();
		}, 2000);
	}

	getCourse(loader:boolean=true){
		if(loader)this.presentPopover();
		let data = {
		  "user_no": this.userDetails.details.user_no,
		  "school_id": this.userDetails.details.school_id,
		  "session_id": this.userDetails.session_id
		};
		this.dataProvider.getSelectedCourses(data).then(response=>{
		  if(loader)this.dissmissPopOver();
		  if(response.session){
		    let courses = response.data;
		    if(courses && courses.length > 0){
		      let i = 0;
		      this.classes = courses||[];
		      this.classes.forEach((course)=>{
	          course.backgroundColor = this.classBackgroundColor[i];
		        i++;
		        if(i == 9) i = 0;
		      })
		    }else{
		      this.noDataFound = this.lang.no_record_found;
		    }
		  }else{
		    this.authProvider.flushLocalStorage();
		    this.router.navigate(['login'], { replaceUrl: true });
		  }
		}).catch(error =>{
			if(loader) this.dissmissPopOver();
		})
	}

	openClassStudents(course){
		const navigation: NavigationExtras = {
			state : {course: course}
		};
		this.zone.run(() => {
			this.router.navigate(['followup-student-list'], navigation);
		});
	}
	createClass(){
		this.router.navigate(['add-class']);
	}

}
 