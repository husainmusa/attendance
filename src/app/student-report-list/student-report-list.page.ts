import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { CalendarComponentOptions } from 'ion2-calendar';

@Component({
  selector: 'app-student-report-list',
  templateUrl: './student-report-list.page.html',
  styleUrls: ['./student-report-list.page.scss'],
})
export class StudentReportListPage implements OnInit {

	  showProfileModal: boolean = false;
	  dateSelected: any;
	  noDataFound: string = "";
	  totalSem: number = 7;
	  student: any = {};
	  userType: string;
	  attendanceResponse: any = {};
	  userDetails: any = {};
	  lang: any = {};
	  students: any = [];
	  studentBehaviour:any = '';
	  courseInfo:any = {};
	  navData:any;
	  classAll=['','','','','','','',''];
    editMode;
	  options = {
	      canBackwardsSelected: true, //By making this true you can access the disabled dates
	      from:1,
	      to:0,
	       disableWeeks: [],
	    daysConfig : <any>[]
	    };
    showCalenderModal:any;
  constructor(public navCtrl: NavController, 
      		  	public dataProvider: DataService,
      		    public authProvider: AuthService, 
      		    public translate: TranslateService,
      		    public alertCtrl: AlertController,
      		    public network: Network,
              	private route : ActivatedRoute,
              	private router:Router,
              	public zone:NgZone, 
	          	public platform: Platform) {
  		this.route.queryParams.subscribe(params => {
	      if (this.router.getCurrentNavigation().extras.state) {
	      		 this.navData = this.router.getCurrentNavigation().extras.state.course;
	      }
	    });

    this.dateSelected = new Date();
    this.translate.get("alertmessages").subscribe((response) => {
      this.lang = response;
    })

  }

  ngOnInit() {
    if (localStorage.getItem("userloggedin")) {
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType = this.userDetails.details.user_type;
      if(this.userType=='1'){
      }
      let data = {
        "user_no": this.userDetails.details.user_no,
        "school_id": this.userDetails.details.school_id,
        "session_id": this.userDetails.session_id
      };
      this.getStudents();
    } else {
      this.dataProvider.hideLoading();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'],{replaceUrl:true});
    }
  }
  ionViewWillEnter() {
    
  }

  onDaySelect(ev){

  }
  hideCalenderModal(){

  }

  /**
   * get the list of students from provider
   */
  getStudents(loader:boolean = true) {
   if(loader) this.dataProvider.showLoading();
    let course = this.navData;
    this.courseInfo = course;
    let studentData = {
      "date": this.dataProvider.getFormatedDate(this.dateSelected),
      "user_no": this.userDetails.details.user_no,
      "session_id": this.userDetails.session_id,
      "course_id": course.cid,
      "school_id": this.userDetails.details.school_id,
    }

    this.dataProvider.getClassStudentList(studentData).then(res => {
     if(loader) this.dataProvider.hideLoading();
      if (res.session) {
        res.data.students.forEach((student)=>{
          student.studentBehaviour = this.getStudentBehaviour(student.agg_ranking);
        })
        this.attendanceResponse = res.data;
      } else {
       if(loader) this.dataProvider.hideLoading();
        this.authProvider.flushLocalStorage();
        this.dataProvider.errorALertMessage(res.message);
        this.router.navigate(['login'],{replaceUrl:true});
       // this.app.getRootNav().setRoot("LoginPage");
      }
    })
  }


  /**
   * Open student detail page
   * @param student_id Id of the student you want to see the details
   */
  openStudentDetail(student_id: string) {
      	const navigation: NavigationExtras = {
	      state : {student_id: student_id,
          course_id: this.navData.cid,
          dateSelected: this.dataProvider.getFormatedDate(this.dateSelected)}
	      };
	      this.zone.run(() => {
	        this.router.navigate(['student-report-manage'], navigation);
	      });
  }

  /**
   * Open image modal popup
   * @param student Object of student details to show in image popup
   */
  openUserImageModal(student: any) {
      this.student = student;
      console.log(this.student);
      this.showProfileModal = true;
  }

  /**
   * Return the behaviour of the student
   * @param agg_ranking ranking
   */
  getStudentBehaviour(agg_ranking){
    if(agg_ranking > 0 && agg_ranking < 2.6){
      return this.lang.warning_behaviour;
    }else if(agg_ranking > 2.5 && agg_ranking < 3.6){
      return this.lang.good_behaviour;
    }else if(agg_ranking > 3.5 && agg_ranking < 4.6){
      return this.lang.very_good_behaviour;
    }else if(agg_ranking > 4.5 && agg_ranking < 5.1){
      return this.lang.excellent_behaviour;
    }else{
      return this.lang.no_behaviour;
    }
  }

  /**
   * Hide image modal popup
   */
  hideUserImageModal(event: any) {
    if (event.target.className == "custom-modal-main") {
      this.showProfileModal = false;
    }
  }



}
 