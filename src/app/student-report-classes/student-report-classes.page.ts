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

@Component({
  selector: 'app-student-report-classes',
  templateUrl: './student-report-classes.page.html',
  styleUrls: ['./student-report-classes.page.scss'],
})
export class StudentReportClassesPage implements OnInit {
  classes:any = [];
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
     setTimeout(()=>{
       this.popOver.dismiss();
     },500);

  }
  doRefresh(event) {
    console.log('Begin async operation');
    this.ngOnInit(false);
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  /**
   * Ionic navigation event will run when page is loaded
   */
  ngOnInit(loader:boolean=true) {
  	this.translate.get("alertmessages").subscribe((res)=>{
        this.lang = res;
	    this.editMode = false;
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
  ionViewWillEnter(){
  }

  getCourse(loader:boolean=true){
    if(loader)this.presentPopover();
    let data = {
      "user_no": this.userDetails.details.user_no,
      "school_id": this.userDetails.details.school_id,
      "session_id": this.userDetails.session_id
    };
    this.dataProvider.getCourses(data).then(response=>{
    // this.getTodayDeshboard(loader);
      if(loader)this.dissmissPopOver();
      if(response.session){
        let courses = response.data;
        if(courses && courses.length > 0){
          let i = 0;
          this.classes = courses;
          this.classes.forEach((course)=>{
            course.backgroundColor = this.classBackgroundColor[i];
            i++;
            if(i == 9) i = 0;
          })
        }else{
          this.noDataFound = this.lang.no_class_found;
        }
      }else{
      //  console.log('here');
        this.authProvider.flushLocalStorage();
        // this.dataProvider.errorALertMessage(response.message);
       this.router.navigate(['login'], { replaceUrl: true });
       // this.app.getRootNav().setRoot("LoginPage");
      }
    }).catch(error =>{
    if(loader) this.dissmissPopOver();
      // this.dataProvider.errorALertMessage(error);
    })
  }


  /**
   * Ionic navigation event will run when page is entered
   */

  /**
   * Open student list or open alert to edit class desc
   * @param course contains the course information
   */
  async openClassStudents(course:any){
    
      const navigation: NavigationExtras = {
        state : {course: course}
      };
      this.zone.run(() => {
        this.router.navigate(['student-report-list'], navigation);
      });
  }

}
