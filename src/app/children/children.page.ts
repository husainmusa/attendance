import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {CreateClassPage } from '../create-class/create-class.page';

@Component({
  selector: 'app-children',
  templateUrl: './children.page.html',
  styleUrls: ['./children.page.scss'],
})
export class ChildrenPage implements OnInit {

  /**
   * @member student: Contains information about the student selected
   * @member students Array of all the childern
   * @member showProfileModal Boolean variable used to show hide the profile modal
   * @member userDetails Contains the user details who is logged in from local storage
   * @member noDataFound used for diplaying the message when no child found
   * @member lang Contains the language translation object
   * @member studentBehaviour selected student behaviour
   */
  student:any = {};
  students:any = [];
  showProfileModal: boolean = false;
  userDetails:any = {};
  noDataFound:string;
  lang:any = {};
  studentBehaviour:any = '';
  ispermit=true;
  /**
   *
   * @param navCtrl Use for navigation between pages
   * @param authProvider Use for authentication purpose
   * @param dataProvider Use for getting data from the API
   * @param translate for translation
   * @param app Root app
   */
  constructor(public navCtrl: NavController,
  			  public dataProvider: DataService,
              public authProvider: AuthService,
              private router:Router,
              private route : ActivatedRoute,
    		  public zone:NgZone,
            //  public app: App,
              public translate: TranslateService) {
              this.translate.get("alertmessages").subscribe((response) => {
                this.lang = response;
              })
              this.dataProvider.language.subscribe((resq)=>{
                this.translate.get("alertmessages").subscribe((res)=>{
                   // console.log(this.lang);
                  this.lang = res;
                })
              })
              this.authProvider.event.subscribe((res)=>{
              //  console.log('change',res)
                if(res.changeUser){
                  this.ionViewWillEnter();
                }
              })
  }

  /**
   * Ionic navigation event will run when page is loaded
   */
  ionViewWillEnter() {
    if (localStorage.getItem("userloggedin")) {
    //  this.dataProvider.hideLoading();
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.students = this.userDetails.details.child;
      if(this.student){
        if(this.students.length == 0){
          this.noDataFound = this.lang.no_student_assigned;
        }
      }else{
        this.noDataFound = this.lang.no_student_assigned;
      }
      
      this.dataProvider.getChildrens({"user_no": this.userDetails.details.user_no, "school_id": this.userDetails.details.school_id}).then((children)=>{
        console.log('children',children);
        this.students = children.data;
        this.userDetails.details.child = children.data;
        this.ispermit=children.permit;
        localStorage.setItem("userloggedin", JSON.stringify(this.userDetails));
      }).catch((error)=>{
        this.dataProvider.errorALertMessage(error);
      })
    } else {
    //  this.dataProvider.hideLoading();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }

  /**
   * Open image modal popup
   * @param student Object of student details to show in image popup
   */
  openUserImageModal(student: any) {
    this.student = student;
    if(student.agg_ranking > 0 && student.agg_ranking < 2.6){
      this.studentBehaviour = this.lang.warning_behaviour;
    }else if(student.agg_ranking > 2.5 && student.agg_ranking < 3.6){
      this.studentBehaviour = this.lang.good_behaviour;
    }else if(student.agg_ranking > 3.5 && student.agg_ranking < 4.6){
      this.studentBehaviour = this.lang.very_good_behaviour;
    }else if(student.agg_ranking > 4.5 && student.agg_ranking < 5.1){
      this.studentBehaviour = this.lang.excellent_behaviour;
    }else{
      this.studentBehaviour = this.lang.no_behaviour;
    }
    this.showProfileModal = true;
  }

  /**
   * Hide image modal popup
   */
  hideUserImageModal(event:any) {
    if (event.target.className == "custom-modal-main") {
      this.showProfileModal = false;
    }
  }

  /**
  * Open student detail page
  * @param student_id Id of the student you want to see the details
  */
 openStudentDetail(student_id: string) {
    // this.navCtrl.push("StudentDetailPage", {
    //   student_id: student_id,
    //   course_id: '',
    //   dateSelected: this.dataProvider.getFormatedDate(new Date())
    // });
    const navigation: NavigationExtras = {
      state : {
	        student_id: student_id,
	        course_id: '',
	        dateSelected: this.dataProvider.getFormatedDate(new Date())
    	}
      };
      //console.log(navigation);
      this.zone.run(() => {
        this.router.navigate(['student-detail'], navigation);
      });

  }
  ngOnInit() {
  }
}
