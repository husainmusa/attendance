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
  selector: 'app-list-student', 
  templateUrl: './list-student.page.html',
  styleUrls: ['./list-student.page.scss'],
})
export class ListStudentPage implements OnInit {

  /**
   * @param showCalenderModal to show and hide the calender
   * @param showProfileModal to show hide the profile modal
   * @param dateSelected selected date from calender default current
   * @member noDataFound used for diplaying the message when no child found
   * @member totalSem total seminars default to 7
   * @member student contains the student object
   * @member canEdit ability to edit the attendance
   * @member userType Logged in user's type
   * @member attendanceResponse contains the response coming from the backend 
   * @member userDetails Contains the user details who is logged in from local storage
   * @member timeLeft Time left to edit the attendance for teacher
   * @member attMarkBegin whether the user start marking the attendance
   * @member selectedSem Sem number which user selected to mark the attendance
   * @member lang Contains the language translation object 
   * @member students conatins the original student list before modification
   * @member attendanceSheet Contains the attendance shett which user marked 
   * @member removeSheet Contains the removed attendance list by the admin
   * @member attMarked teacher/moderator marked the attendance of all the students
   * @member editMode Whether user enabled the edit mode or not
   * @member currentEvents conatins the list of all holidays for calender
   * @member holidayString contains the holiday in the for of string
   * @member lastSemAtt contains the last semester attendnace
   * @member isHoliday to check whether the selected date is holiday or not
   * @member studentBehaviour selected student behaviour 
   * @member courseInfo Contains the course info to display on front end
   */
  showCalenderModal: boolean = false;
  showProfileModal: boolean = false;
  dateSelected: any;
  noDataFound: string = "";
  totalSem: number = 7;
  student: any = {};
  canEdit: boolean = false;
  userType: string;
  attendanceResponse: any = {};
  userDetails: any = {};
  timeLeft: number;
  attMarkBegin: boolean = false;
  selectedSem: number = -1;
  lang: any = {};
  students: any = [];
  attendanceSheet: any = {};
  removeSheet: any = {};
  attMarked: boolean = false;
  editMode: boolean = false;
  currentEvents: any = [];
  holidayString: string = "";
  lastSemAtt: any;
  isHoliday: boolean = false;
  studentBehaviour:any = '';
  courseInfo:any = {};
  navData:any;
  notes:any;
  teacher_type:any;
  showAll=true;
  classAll=['','','','','','','',''];
  options = {
      canBackwardsSelected: true, //By making this true you can access the disabled dates
      from:1,
      to:0,
       disableWeeks: [],
    daysConfig : <any>[]
    };
    canAddStudent:any=false;
  /**
   * 
   * @param router Use for navigation between pages
   * @param ActivatedRoute Use to get the value passed from previous page
   * @param app   Root app 
   * @param dataProvider  Use for getting data from the API
   * @param authProvider  Use for authentication purpose
   * @param translate For transaltion messages 
   * @param alertCtrl Alert controller object of AlertController class
   * @param camera Used for taking picture from camera plugin
   * @param network Network object of plugin NetworkInformation
   * @param platform platform object 
   */
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
      this.dataProvider.getHolidays(data).then(response => {
        if(response){
          if (response.holidays.length > 0) {
            this.holidayString = response.holiday_string;
            response.holidays.forEach(holiday => {
              let date = new Date(holiday.date);
              let p={
                date: holiday.date,
                disable: true
              }
              this.options.daysConfig.push(p);
              this.currentEvents.push({
                year: date.getFullYear(),
                month: date.getMonth(),
                date: date.getDate()
              })
            })
          }
          let day = this.dateSelected.getDate();
          day = day < 10 ? '0' + day : day;
          let month = this.dateSelected.getMonth();
          month = month + 1;
          month = month < 10 ? '0' + month : month;
  
          let strint_date = this.dateSelected.getFullYear() + '-' + month + '-' + day;
          if (this.holidayString.indexOf(strint_date) > -1) {
            this.isHoliday = true;
          } else {
            this.isHoliday = false;
          }
        }
      }).catch(error => {
        this.dataProvider.hideLoading();
        this.dataProvider.errorALertMessage(error);
      })
      this.getStudents();
    } else {
      this.dataProvider.hideLoading();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'],{replaceUrl:true});
    }
  }
  ionViewWillEnter() {
    
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
    if(localStorage.getItem("classlocalatt")){
      let attendance = JSON.parse(localStorage.getItem("classlocalatt"));
      Object.keys(attendance).map((courseId)=>{
        if(!this.checkCurrentDate(new Date(attendance[courseId].date)) && localStorage.getItem("classlocalatt")){
          localStorage.removeItem("classlocalatt");
        }
      })
    }

    this.dataProvider.getClassStudentList(studentData).then(res => {
     if(loader) this.dataProvider.hideLoading();
      if (res.session) {

        this.canAddStudent=false;
        if(res.data){
          if (this.userType=='3' && res.data.canAddStudent){
            this.canAddStudent=true;
          }
        }

        this.attMarkBegin = false;
        this.canEdit = false;
        this.selectedSem = -1;
        res.data.students.forEach((student)=>{
          student.studentBehaviour = this.getStudentBehaviour(student.agg_ranking);
        })
        this.attendanceResponse = res.data;
        this.attendanceSheet = {};
        this.removeSheet = {};
        this.attMarked = false;
        this.editMode = false;
        this.lastSemAtt = parseInt(res.data.last_cem);
        
        this.students = JSON.parse(JSON.stringify(res.data.students));
        if (this.attendanceResponse.totalsems) this.totalSem = parseInt(this.attendanceResponse.totalsems);
        this.checkEditModeOfUser();
        if (this.attendanceResponse.students && this.attendanceResponse.students.length == 0) {
          this.noDataFound = this.lang.no_students_in_class;
        }
        if(this.checkDateSelected(new Date())){
          if(localStorage.getItem("classlocalatt")){
            let localAtt:any = {};
            localAtt = JSON.parse(localStorage.getItem("classlocalatt"));
            this.attendanceResponse.date = this.dataProvider.getFormatedDate(this.dateSelected);
            localAtt[course.cid] = this.attendanceResponse;
            localStorage.setItem("classlocalatt", JSON.stringify(localAtt));
          }else{
            let localAtt:any = {};
            this.attendanceResponse.date = this.dataProvider.getFormatedDate(this.dateSelected);
            localAtt[course.cid] = this.attendanceResponse;
            this.dataProvider.getFormatedDate(this.dateSelected)
            localStorage.setItem("classlocalatt", JSON.stringify(localAtt));
          }
        }

        console.log('attendanceResponse',this.attendanceResponse);
      } else {
       if(loader) this.dataProvider.hideLoading();
        this.authProvider.flushLocalStorage();
        this.dataProvider.errorALertMessage(res.message);
        this.router.navigate(['login'],{replaceUrl:true});
       // this.app.getRootNav().setRoot("LoginPage");
      }
    })
  }

 
    viewNote(){
      const navigation: NavigationExtras = {
        state : {
          course: this.navData,
          course_id: this.navData.cid,
          dateSelected: this.dataProvider.getFormatedDate(this.dateSelected),
          students:this.students}
        };
        //console.log(navigation);
        this.zone.run(() => {
          this.router.navigate(['view-notes'], navigation);
        });
    }

  /**
  * Check the attendance edit mode of user
  */
  checkEditModeOfUser() {
    // admin check
    console.log(this.userType);
    if (this.userType == "1") {
      this.canEdit = true;
    } else if (this.userType == "2") { // teacher check
      this.checkTeacherEditPowers();
    } else if (this.userType == "3") { // moderator check
      this.checkModeratorEditPowers();
    } else if (this.userType == "4") { // parent check

    }
  }

  /**
   * check the power of teacher for edit mode
   */
  checkTeacherEditPowers() {
    this.dataProvider.postRequest({}, "ManroxTeacherAllowedForEditChk/" + this.userDetails.details.user_no).then((response) => {
      // if (response && response.isSubmitted && response.editPermission && response.allotedtime != null && response.time_diffrence != null && (parseInt(response.allotedtime) - parseInt(response.time_diffrence)) > 0) {
      //   console.log('response',response);
      //   this.canEdit = true;
      //   this.timeLeft = response.allotedtime - response.time_diffrence;
      //   this.teacher_type=response.teacher_type;
      //   let interval = setInterval(() => {
      //     this.timeLeft--;
      //     if (this.timeLeft <= 0) {
      //       this.canEdit = false;
      //       clearInterval(interval);
      //     }
      //   }, 1000);
      // }else{
      //   if(res.isSubmitted)
      // }
          this.teacher_type=response.teacher_type;
          console.log(response.teacher_type);
    if(response && response.editPermission){
       console.log('response && response.editPermission',response , response.editPermission)
        if(response.isSubmitted && response.allotedtime != null){
          this.canEdit = true;
          this.showAll=false;
          this.timeLeft = response.allotedtime - response.time_diffrence;
          let interval = setInterval(() => {
            this.timeLeft--;
            if (this.timeLeft <= 0) {
            console.log(this.timeLeft);
          this.showAll=true;
              this.canEdit = false;
              clearInterval(interval);
            }
          }, 1000);
        }else{
          this.canEdit=false;
        }

    }



    }).catch((error) => {
      console.log("error1")
      this.dataProvider.errorALertMessage(error);
    })
  }

  /**
  * check the power of moderator for edit mode
  */
  checkModeratorEditPowers() {
    this.dataProvider.postRequest({}, "ManroxModeratorAllowedForEditChk/" + this.userDetails.details.user_no).then((response) => {
      if(response){
        let currentDate = new Date();
        if (response && (currentDate.getTime() - this.dateSelected.getTime() < 172800000)) {
          this.canEdit = true;
        }
      }
    }).catch((error) => {
      this.dataProvider.errorALertMessage(error);
    })
  }
  /**
   * Open student detail page
   * @param student_id Id of the student you want to see the details
   */
  openStudentDetail(student_id: string) {
      if (!this.attMarkBegin) {
      	const navigation: NavigationExtras = {
	      state : {student_id: student_id,
          course_id: this.navData.cid,
          dateSelected: this.dataProvider.getFormatedDate(this.dateSelected)}
	      };
	      this.zone.run(() => {
	        this.router.navigate(['student-detail'], navigation);
	      });
      } else {
        this.dataProvider.showToast(this.lang.complete_att_submission);
      }
  }

  /**
   * Open image modal popup
   * @param student Object of student details to show in image popup
   */
  openUserImageModal(student: any) {
    if (!this.attMarkBegin) {
      this.student = student;
      console.log(this.student);
      this.showProfileModal = true;
    } else {
      this.dataProvider.showToast(this.lang.complete_att_submission);
    }
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

  /**
   * Use to open the calender
   */
  openCalenderModal() {
    if(this.platform.is('cordova')){
      if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN){
        this.showCalenderModal = true;
          let query = document.getElementsByName('ios-arrow-forward');
          let query1 = document.getElementsByName('ios-arrow-back');
          let query2 = document.getElementsByName('md-arrow-dropdown');
          console.log(query2);
          setTimeout(()=>{
            query[0]['name'] = "chevron-forward-outline";
            query1[0]['name']="chevron-back-outline";
            query2[0]['name']="chevron-down-outline";
          },500);
      }else{
        this.dataProvider.showToast(this.lang.no_internet);
      }
    }else{
      this.showCalenderModal = true;
      let query = document.getElementsByName('ios-arrow-forward');
          let query1 = document.getElementsByName('ios-arrow-back');
          let query2 = document.getElementsByClassName('arrow-dropdown');
          console.log(query2);
          setTimeout(()=>{
            query[0]['name'] = "chevron-forward-outline";
            query1[0]['name']="chevron-back-outline";
            query2[0]['name']="chevron-down-outline";
          },500);
    }
  }

  /**
   * Use to hide the calender
   */
  hideCalenderModal() {
    this.showCalenderModal = false;
  }

  /** calender event
   * Triggered when user select the date from the calender
   * @param event calender event to get the selected date 
   */
  onDaySelect(event: any) {
      if (event != undefined && event != null) {
      let date = new Date(event);
      console.log(event);

      let day = event.date;
      day = day < 10 ? '0' + day : day;
      let month = event.month;
      month = month + 1;
      month = month < 10 ? '0' + month : month;

      let strint_date = event.year + '-' + month + '-' + day;
      if (this.holidayString.indexOf(event) == -1) {
        this.dateSelected = date;
        let currentDate = new Date();
        if (this.dateSelected.getTime() <= currentDate.getTime()) {
          this.isHoliday = false;
          this.hideCalenderModal();
          this.getStudents();
        } else {
          this.dataProvider.showToast(this.lang.future_date);
        }
      } else {
        this.dataProvider.showToast(this.lang.holiday);
      }  
    }
  }

  /**
   * @returns array of number of semesters
   */
  getSemArray() {
    return new Array(this.totalSem);
  }

  /**
   * For enabling editing mode
   */
  enableEditingMode() {
    this.editMode = true;
    this.dataProvider.showToast(this.lang.edit_mode_enabled);
  }

  /**
   * Change the status of the attendance
   * @param student student object whose attendance is selected to change
   * @param sem semeseter
   */
changeAttendanceStatus___old(student: any, sem: number) {
  // console.log(this.canEdit);
    if(!this.isHoliday){ 
      let date = new Date();
      if (!this.canEdit && !this.checkDateSelected(date)) {
        this.dataProvider.showToast(this.lang.not_allowed_att_date);
      } else {
        if (this.selectedSem != sem && this.selectedSem != -1 && this.userType != '1') {
          this.dataProvider.showToast(this.lang.att_not_complete_err);

        } else if (student.sheet['cem-' + (sem + 1)] == '3') {
          this.dataProvider.showToast(this.lang.delay_att_mod_error);

        } else if (this.lastSemAtt >= (sem + 1) && !this.canEdit && this.attendanceResponse.semteacher['sem-'+(sem+1)] != undefined) {
          this.dataProvider.showToast(this.lang.att_modification_error);

        } else if (this.canEdit && !this.editMode) {
          this.dataProvider.showToast(this.lang.enable_edit);

        } 
        else if (this.canEdit && student.sheet['cem-' + (sem + 1)] != undefined && student.sheet['entered_by-' + (sem + 1)] != this.userDetails.details.user_no && this.userType == "2") {
          this.dataProvider.showToast(this.lang.att_modification_error);

        } 
        else if(student.suspend_leave && student.medical_leave || student.sheet['api_side-'+(sem+1)] == '1'){
          this.dataProvider.showToast(this.lang.att_modification_error);

        }else {
          if (this.userType == '2' || this.userType == '3') {
            if (this.selectedSem == -1) {
              this.selectedSem = sem;
              this.attMarkBegin = true;
              this.attendanceSheet['cem-' + (sem + 1)] = {};
            }
            if (student.sheet['cem-' + (sem + 1)] == '1') { // present
              this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = '0';
              student.sheet['cem-' + (sem + 1)] = '0';    // mark absent
            } else {
              student.sheet['cem-' + (sem + 1)] = '1'; // mark present
              this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = '1';
            }
            let totalAttendanceMarked = 0;
            this.attendanceResponse.students.forEach((item: any) => {
              if (item.sheet['cem-' + (sem + 1)] != undefined && item.sheet['cem-' + (sem + 1)] != 'undefined') {
                totalAttendanceMarked++;
              }
            })
            this.attMarked = this.students.length == totalAttendanceMarked ? true : false;
          }
          else if(this.userType == '1') {
            if (this.attendanceSheet['cem-' + (sem + 1)] == undefined) {
              this.attendanceSheet['cem-' + (sem + 1)] = {};
              this.attMarkBegin = true;
            }

            if (student.sheet['cem-' + (sem + 1)] == '1') { // present
              student.sheet['cem-' + (sem + 1)] = '0';    // mark absent
              this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = '0';
              if (this.removeSheet[(sem + 1) + '-' + student.sid] != undefined) {
                delete this.removeSheet[(sem + 1) + '-' + student.sid];
              }
            } else if (student.sheet['cem-' + (sem + 1)] == '0' && this.userType == '1') {
              student.sheet['cem-' + (sem + 1)] = 'undefined'; // remove attendance
              delete this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid];
              this.removeSheet[(sem + 1) + '-' + student.sid] = {
                sid: student.sid,
                sem: sem + 1
              }
            } else {
              student.sheet['cem-' + (sem + 1)] = '1'; // mark present
              this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = '1';
              if (this.removeSheet[(sem + 1) + '-' + student.sid] != undefined) {
                delete this.removeSheet[(sem + 1) + '-' + student.sid];
              }
            }
          }
        }
      }
    }else{
      this.dataProvider.showToast(this.lang.holiday);
    }
  }

  changeAttendanceStatus(student: any, sem: number,ind){
  //  console.log(student);
    if(!this.isHoliday){
      let date = new Date();
      if (!this.canEdit && !this.checkDateSelected(date)) {
        this.dataProvider.showToast(this.lang.not_allowed_att_date);
      } else {
        if (this.selectedSem != sem && this.selectedSem != -1 && this.userType != '1' ) {
          console.log('1');
          this.dataProvider.showToast(this.lang.att_not_complete_err);

        } else if (student.sheet['cem-' + (sem + 1)] == '3') {
          console.log('2');
          this.dataProvider.showToast(this.lang.delay_att_mod_error);

        } else if (this.lastSemAtt >= (sem + 1) && !this.canEdit && this.attendanceResponse.semteacher['sem-'+(sem+1)] != undefined && this.teacher_type!='split') {
          console.log('3');
          this.dataProvider.showToast(this.lang.att_modification_error);

        }
        else if(student.sheet['cem-' + (sem + 1)] &&  student.sheet['entered_by-' + (sem + 1)] && !this.editMode && this.teacher_type=='split'){
          this.dataProvider.showToast(this.lang.att_modification_error);
        } //new condition for split
         else if (this.canEdit && !this.editMode) {
          console.log('4');
          this.dataProvider.showToast(this.lang.enable_edit);

        } else if (this.canEdit && student.sheet['cem-' + (sem + 1)] != undefined && student.sheet['entered_by-' + (sem + 1)] != this.userDetails.details.user_no && this.userType == "2") {
          console.log('5');
          this.dataProvider.showToast(this.lang.att_modification_error);

        } else if(student.suspend_leave && student.medical_leave || student.sheet['api_side-'+(sem+1)] == '1'){
          console.log('6');
          this.dataProvider.showToast(this.lang.att_modification_error);

        }else {
          if (this.userType == '2' || this.userType == '3') {
          console.log('7');
            if (this.selectedSem == -1) {
              this.selectedSem = sem;
              this.attMarkBegin = true;
              this.attendanceSheet['cem-' + (sem + 1)] = {};
            }
            if (student.sheet['cem-' + (sem + 1)] == '1') { // present
              this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = '0';
              student.sheet['cem-' + (sem + 1)] = '0';    // mark absent
            } else {
              student.sheet['cem-' + (sem + 1)] = '1'; // mark present
              this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = '1';
            }
            let totalAttendanceMarked = 0;
            this.attendanceResponse.students.forEach((item: any) => {
              if (item.sheet['cem-' + (sem + 1)] != undefined && item.sheet['cem-' + (sem + 1)] != 'undefined') {
                totalAttendanceMarked++;
              }
            })
            this.attMarked = this.students.length == totalAttendanceMarked ? true : false;
          }
          else if(this.userType == '1') {
            if (this.attendanceSheet['cem-' + (sem + 1)] == undefined) {
              this.attendanceSheet['cem-' + (sem + 1)] = {};
              this.attMarkBegin = true;
            }

            if (student.sheet['cem-' + (sem + 1)] == '1') { // present
              student.sheet['cem-' + (sem + 1)] = '0';    // mark absent
              this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = '0';
              if (this.removeSheet[(sem + 1) + '-' + student.sid] != undefined) {
                delete this.removeSheet[(sem + 1) + '-' + student.sid];
              }
            } else if (student.sheet['cem-' + (sem + 1)] == '0' && this.userType == '1') {
              student.sheet['cem-' + (sem + 1)] = 'undefined'; // remove attendance
              delete this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid];
              this.removeSheet[(sem + 1) + '-' + student.sid] = {
                sid: student.sid,
                sem: sem + 1
              }
            } else {
              student.sheet['cem-' + (sem + 1)] = '1'; // mark present
              this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = '1';
              if (this.removeSheet[(sem + 1) + '-' + student.sid] != undefined) {
                delete this.removeSheet[(sem + 1) + '-' + student.sid];
              }
            }
          }
        }
      }
    }else{
      this.dataProvider.showToast(this.lang.holiday);
    }
  }


  /** mark all studence attendence

  **/

  changeStatusAllStudents(student,sem,status){
    // console.log(this.canEdit);
        if(!this.isHoliday){ 
      let date = new Date();
      if (!this.canEdit && !this.checkDateSelected(date)) {
         console.log(this.canEdit);
       // this.dataProvider.showToast(this.lang.not_allowed_att_date);
      } else {
        if (this.selectedSem != sem && this.selectedSem != -1 && this.userType != '1') {
         console.log(this.canEdit);
        //  this.dataProvider.showToast(this.lang.att_not_complete_err);

        } else if (student.sheet['cem-' + (sem + 1)] == '3') {
         console.log(this.canEdit);
        //  this.dataProvider.showToast(this.lang.delay_att_mod_error);

        } else if (this.lastSemAtt >= (sem + 1) && !this.canEdit && this.attendanceResponse.semteacher['sem-'+(sem+1)] != undefined && this.teacher_type!='split') {
          console.log(this.canEdit);
        
        //  this.dataProvider.showToast(this.lang.att_modification_error);

        }
        else if(student.sheet['cem-' + (sem + 1)] &&  student.sheet['entered_by-' + (sem + 1)] && !this.editMode && this.teacher_type=='split'){
          // this.dataProvider.showToast(this.lang.att_modification_error);
        }
         else if (this.canEdit && !this.editMode) {
        //  this.dataProvider.showToast(this.lang.enable_edit);

        } 
        // else if (this.canEdit && student.sheet['cem-' + (sem + 1)] != undefined && student.sheet['entered_by-' + (sem + 1)] != this.userDetails.details.user_no && this.userType == "2") {
        //  console.log(this.canEdit);
        //   this.dataProvider.showToast(this.lang.att_modification_error);

        // }
         else if(student.suspend_leave && student.medical_leave || student.sheet['api_side-'+(sem+1)] == '1'){
         console.log(this.canEdit);
        //  this.dataProvider.showToast(this.lang.att_modification_error);

        }else {
          
            if (this.attendanceSheet['cem-' + (sem + 1)] == undefined) {
              this.attendanceSheet['cem-' + (sem + 1)] = {};
              this.attMarkBegin = true;
            }
            this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid] = status;
            if(this.userType == '2' || this.userType == '3'){

              if (this.selectedSem == -1) {
              this.selectedSem = sem;
              this.attMarkBegin = true;
            }
              if (student.sheet['cem-' + (sem + 1)] == '1') { // present
              student.sheet['cem-' + (sem + 1)] = status;    // mark absent
            } else {
              student.sheet['cem-' + (sem + 1)] = status; // mark present
            }
            let totalAttendanceMarked = 0;
            this.attendanceResponse.students.forEach((item: any) => {
              if (item.sheet['cem-' + (sem + 1)] != undefined && item.sheet['cem-' + (sem + 1)] != 'undefined') {
                totalAttendanceMarked++;
              }
            })
            this.attMarked = this.students.length == totalAttendanceMarked ? true : false;
            }

            if(this.userType == '1') {

            if (student.sheet['cem-' + (sem + 1)] == '1') { // present
              student.sheet['cem-' + (sem + 1)] = status;    // mark absent
              if (this.removeSheet[(sem + 1) + '-' + student.sid] != undefined) {
                delete this.removeSheet[(sem + 1) + '-' + student.sid];
              }
            } else if (student.sheet['cem-' + (sem + 1)] == '0' && this.userType == '1') {
              student.sheet['cem-' + (sem + 1)] = status; // remove attendance
              delete this.attendanceSheet['cem-' + (sem + 1)]['sid-' + student.sid];
              this.removeSheet[(sem + 1) + '-' + student.sid] = {
                sid: student.sid,
                sem: sem + 1
              }
            } else {
              student.sheet['cem-' + (sem + 1)] = status; // mark present
              if (this.removeSheet[(sem + 1) + '-' + student.sid] != undefined) {
                delete this.removeSheet[(sem + 1) + '-' + student.sid];
              }
            }
          }


             // console.log(this.attendanceSheet);
        }
      }
    }else{
      this.dataProvider.showToast(this.lang.holiday);
    }

  }

 changeAttendanceStatusAll(sem){
   let date = new Date();
   if(!this.isHoliday){
      if (!this.canEdit && !this.checkDateSelected(date)) {
        this.dataProvider.showToast(this.lang.not_allowed_att_date);
      }else{
        if (this.selectedSem != sem && this.selectedSem != -1 && this.userType != '1') {
          this.dataProvider.showToast(this.lang.att_not_complete_err);

        } else if (this.lastSemAtt >= (sem + 1) && !this.canEdit && this.attendanceResponse.semteacher['sem-'+(sem+1)] != undefined && this.teacher_type!='split') {
          this.dataProvider.showToast(this.lang.att_modification_error);

        } else if (this.canEdit && !this.editMode) {
            this.dataProvider.showToast(this.lang.enable_edit);

         }else{
               let status = 'undefined';
               if(this.userType=='1'){
                 if(this.classAll[sem]==''){
                    this.classAll[sem]='present';
                    status = '1';
                  }else if(this.classAll[sem]=='present'){
                    this.classAll[sem]='absent'; 
                     status = '0';
                  }else if(this.classAll[sem]=='absent'){
                    this.classAll[sem]=''; 
                    status = 'undefined';
                  }
               }else{
                 if(this.classAll[sem]==''){
                    this.classAll[sem]='present';
                    status = '1';
                  }else if(this.classAll[sem]=='present'){
                    this.classAll[sem]='absent'; 
                     status = '0';
                  }else if(this.classAll[sem]=='absent'){
                   this.classAll[sem]='present';
                    status = '1';
                  }
               }
              this.attendanceResponse.students.forEach(student=>{
               
                this.changeStatusAllStudents(student,sem,status); 
              });
            }
          }
        }

 }

  changeAttendanceStatusAll____OLD(sem){
    console.log('sem',sem)
    let date = new Date();
    if(!this.isHoliday){
      if (!this.canEdit && !this.checkDateSelected(date)) {
        this.dataProvider.showToast(this.lang.not_allowed_att_date);
      }else{
        if (this.selectedSem != sem && this.selectedSem != -1 && this.userType != '1') {
          this.dataProvider.showToast(this.lang.att_not_complete_err);

        } else if (this.lastSemAtt >= (sem + 1) && !this.canEdit && this.attendanceResponse.semteacher['sem-'+(sem+1)] != undefined) {
          this.dataProvider.showToast(this.lang.att_modification_error);

        } else if (this.canEdit && !this.editMode) {
            this.dataProvider.showToast(this.lang.enable_edit);

         }else{

            this.attendanceResponse.students.forEach(student=>{

              console.log(student);


                 this.changeAttendanceStatus(student, sem,'');
              })
              if(this.classAll[sem]==''){
                this.classAll[sem]='present';
              }else if(this.classAll[sem]=='present'){
                this.classAll[sem]='absent'; 
              }else if(this.classAll[sem]=='absent'){
                this.classAll[sem]=''; 
              }
         }
      }
    }else{
      this.dataProvider.showToast(this.lang.holiday);
    }
  }

  /**
   * function to match the dates
   * @param date date with which compare the selected date
   */
  checkDateSelected(date: Date) {
    if (date.getDate() == this.dateSelected.getDate() && date.getMonth() == this.dateSelected.getMonth() && date.getFullYear() == this.dateSelected.getFullYear()) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * function to caheck the current date
   * @param date date with which compare the current date
   */
  checkCurrentDate(date: Date) {
    let currentDate = new Date();
    if (date.getDate() == currentDate.getDate() && date.getMonth() == currentDate.getMonth() && date.getFullYear() == currentDate.getFullYear()) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * alert to show image take choice
   */
  async takePicture() {
    if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN){
     const alert=await this.alertCtrl.create({
        header: this.lang.image_option,
        buttons: [
          {
            text: this.lang.camera,
            handler: () => {
              this.openCamera();
            }
          },
          {
            text: this.lang.gallery,
            handler: () => {
              this.openGallery()
            }
          }
        ]
      })
     await alert.present()
    }else{
      this.dataProvider.showToast(this.lang.no_internet);
    }
  }

  /**
   * mobile camera to take image 
   */
  openCamera() {
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.CAMERA,
      targetHeight: 500,
      targetWidth: 500
    }

    this.camera.getPicture(options).then((imageData) => {
      if (imageData) {
        this.dataProvider.showLoading();
        let data = {
          user_no: this.userDetails.details.user_no,
          session_id: this.userDetails.session_id,
          imageData: "data:image/png;base64,"+imageData,
          sid: this.student.sid
        }
        this.dataProvider.updateUserImage(data).then((response) => {
          this.dataProvider.hideLoading();
          if (response.session) {
            this.student.pic = response.url;
          } else {
            this.authProvider.flushLocalStorage();
            this.dataProvider.errorALertMessage(response.message);
            this.router.navigate(['login'],{replaceUrl:true});
           // this.app.getRootNav().setRoot("LoginPage");
          }
        }).catch((error) => {
          this.dataProvider.hideLoading();
          this.dataProvider.errorALertMessage(error);
        })
      }
    })
  }

  /**
   * Open gallery to take image
   */
  openGallery() {
    let options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.PNG,
      mediaType: this.camera.MediaType.PICTURE,
      allowEdit: true,
      correctOrientation: true,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetHeight: 500,
      targetWidth: 500
    }

    this.camera.getPicture(options).then((imageData) => {
      if (imageData) {
        this.dataProvider.showLoading();
        let data = {
          user_no: this.userDetails.details.user_no,
          session_id: this.userDetails.session_id,
          imageData: "data:image/png;base64,"+imageData,
          sid: this.student.sid
        }
        this.dataProvider.updateUserImage(data).then((response) => {
          this.dataProvider.hideLoading();
          if (response.session) {
            this.student.pic = response.url;
          } else {
            this.authProvider.flushLocalStorage();
            this.dataProvider.errorALertMessage(response.message);
            this.router.navigate(['login'],{replaceUrl:true});
           // this.app.getRootNav().setRoot("LoginPage");
          }
        }).catch((error) => {
          this.dataProvider.hideLoading();
          this.dataProvider.errorALertMessage(error);
        })
      }
    })
  }

  /**
   * Function to show the teacher name who marked the attendance
   * @param semTeacher contains the teacher name
   */
  showTeacherName(semTeacher: any) {
    if (semTeacher != undefined && semTeacher != 'undefined') {
      this.dataProvider.showToast(this.lang.updatedby + " : " + semTeacher.teacher);
    }
  }

  /**
   * Attendance submit function
   */
  submitAttendance() {
    console.log('this.teacher_type',this.teacher_type)
    if(this.teacher_type=='regular'){
      console.log('[here1]');
      if(this.checkAttendence()){
        if (this.attMarked || ((Object.keys(this.attendanceSheet).length > 0 || Object.keys(this.removeSheet).length > 0))) {
            this.dataProvider.showLoading();
            let data: any = {};
            data.sheet = this.attendanceSheet;
            data.user_no = this.userDetails.details.user_no;
            data.session_id = this.userDetails.session_id;
            data.cid = this.navData.cid;
            data.date = this.dataProvider.getFormatedDate(this.dateSelected);
            data.removal_sheet = this.removeSheet;
            data.school_id = this.userDetails.details.school_id;
            console.log('atendence',data);
            if(this.platform.is('cordova')){
              if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN){
                this.dataProvider.markAttendance(data).then((response) => {
                  this.dataProvider.hideLoading();
                  if (response.session) {
                    this.dataProvider.showToast(response.message);
                    this.getStudents(false);

                   // this.navCtrl.setRoot(TabsPage);
                   this.router.navigate(['tabs'],{replaceUrl:true});
                  } else {
                    this.authProvider.flushLocalStorage();
                    this.dataProvider.errorALertMessage(response.message);
                    this.router.navigate(['login'],{replaceUrl:true});
                   // this.app.getRootNav().setRoot("LoginPage");
                  }
                }).catch((error) => {
                  this.dataProvider.hideLoading();
                  this.dataProvider.errorALertMessage(error);
                })
              }else{
                this.dataProvider.hideLoading();
                if(localStorage.getItem("attendance")){
                  let attendance = JSON.parse(localStorage.getItem("attendance"));
                  attendance.push(data);
                  localStorage.setItem("attendance", JSON.stringify(attendance));
                }else{
                  let attendance = [];
                  attendance.push(data);
                  localStorage.setItem("attendance", JSON.stringify(attendance));
                }
                this.dataProvider.showToast(this.lang.offline_att_stored);
              }
            }else{
              this.dataProvider.markAttendance(data).then((response) => {
                this.dataProvider.hideLoading(); 
                if (response.session) {
                  this.dataProvider.showToast(response.message);
                  this.getStudents(false);
                  this.router.navigate(['tabs'],{replaceUrl:true});
                 // this.navCtrl.setRoot(TabsPage);
                } else {
                  this.authProvider.flushLocalStorage();
                  this.dataProvider.errorALertMessage(response.message);
                  this.router.navigate(['login'],{replaceUrl:true});
                 // this.app.getRootNav().setRoot("LoginPage");
                }
              }).catch((error) => {
                this.dataProvider.hideLoading();
                this.dataProvider.errorALertMessage(error);
              })
            }
          } else {
            this.dataProvider.showToast(this.lang.att_not_complete_err);
          }
      }else{
        this.dataProvider.showToast(this.lang.att_not_all_complete_err);
      }
    }else{
      console.log('[here2]');
      if (this.attMarked || ((Object.keys(this.attendanceSheet).length > 0 || Object.keys(this.removeSheet).length > 0))) {
      this.dataProvider.showLoading();
      console.log('[here3]');
      let data: any = {};
      data.sheet = this.attendanceSheet;
      data.user_no = this.userDetails.details.user_no;
      data.session_id = this.userDetails.session_id;
      data.cid = this.navData.cid;
      data.date = this.dataProvider.getFormatedDate(this.dateSelected);
      data.removal_sheet = this.removeSheet;
      data.school_id = this.userDetails.details.school_id;
      console.log('atendence',data);
     // this.checkAttendence();
      if(this.platform.is('cordova')){
        if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN){
          this.dataProvider.markAttendance(data).then((response) => {
            this.dataProvider.hideLoading();
            if (response.session) {
              this.dataProvider.showToast(response.message);
              this.getStudents(false);

             // this.navCtrl.setRoot(TabsPage);
             this.router.navigate(['tabs'],{replaceUrl:true});
            } else {
              this.authProvider.flushLocalStorage();
              this.dataProvider.errorALertMessage(response.message);
              this.router.navigate(['login'],{replaceUrl:true});
             // this.app.getRootNav().setRoot("LoginPage");
            }
          }).catch((error) => {
            this.dataProvider.hideLoading();
            this.dataProvider.errorALertMessage(error);
          })
        }else{
          this.dataProvider.hideLoading();
          if(localStorage.getItem("attendance")){
            let attendance = JSON.parse(localStorage.getItem("attendance"));
            attendance.push(data);
            localStorage.setItem("attendance", JSON.stringify(attendance));
          }else{
            let attendance = [];
            attendance.push(data);
            localStorage.setItem("attendance", JSON.stringify(attendance));
          }
          this.dataProvider.showToast(this.lang.offline_att_stored);
        }
      }else{
        this.dataProvider.markAttendance(data).then((response) => {
          this.dataProvider.hideLoading(); 
          if (response.session) {
            this.dataProvider.showToast(response.message);
            this.getStudents(false);
            this.router.navigate(['tabs'],{replaceUrl:true});
           // this.navCtrl.setRoot(TabsPage);
          } else {
            this.authProvider.flushLocalStorage();
            this.dataProvider.errorALertMessage(response.message);
            this.router.navigate(['login'],{replaceUrl:true});
           // this.app.getRootNav().setRoot("LoginPage");
          }
        }).catch((error) => {
          this.dataProvider.hideLoading();
          this.dataProvider.errorALertMessage(error);
        })
      }
    } else {
      this.dataProvider.showToast(this.lang.att_not_complete_err);
    }
    }
    console.log(this.attendanceSheet);
    
  }
/* check attendence for regular teacher */
  checkAttendence(){
    if(this.canEdit ){
      return true;
    }else{
      if(this.teacher_type && this.teacher_type=='regular'){
        for (let i = 1; i <= this.attendanceResponse.totalsems; i++) {
              console.log('here');
          if(this.attendanceSheet['cem-'+i]){
            let obj=[];
            let me=this;
            Object.keys(this.attendanceSheet['cem-'+i]).forEach(function (key) {
                       obj.push(me.attendanceSheet['cem-'+i][key]);
                  });
              // console.log('here1',this.attendanceSheet['cem-'+i],'cem-'+i,obj);
            if(obj.length!=this.students.length){
              // console.log('here2',obj.length,this.students.length);
              return false;
            }else{
              return true;
              // console.log(obj.length,this.students.length);
            }
          }
        }
      }
    }
  }


  /**
   * Register new student
   */
 async registerNewStudent() {
  this.translate.get("reg_student").subscribe((response) => {
     this.presentAler(response);
    })
  }
  async presentAler(response){
  	const alert= await this.alertCtrl.create({
        header: response.title,
        inputs: [
          {
            name: 'student_name',
            type: 'text',
            placeholder: response.student_name
          },
          {
            name: 'student_id',
            type: 'number',
            placeholder: response.student_id
          }
        ],
        buttons: [
          {
            text: response.cancel,
            role: 'cancel'
          },
          {
            text: response.register,
            handler: (data)=>{
              console.log(data);
              if(data.student_name == '' || data.student_name.trim() == ''){
                this.dataProvider.showToast(response.invalid_stu_name);
                return false;
              }else if(data.student_id == '' || data.student_id == 0){
                this.dataProvider.showToast(response.invalid_stu_id);
                return false;
              }else {
                data.student_id = parseInt(data.student_id);
                if(Number.isInteger(data.student_id)){
                  this.dataProvider.showLoading();
                  this.dataProvider.registerStudent({
                    "name": data.student_name,
                    "student_id": data.student_id,
                    "user_no": this.userDetails.details.user_no,
                    "school_id": this.userDetails.details.school_id,
                    "course_id": this.courseInfo.cid
                  }).then((res)=>{
                    this.dataProvider.hideLoading();
                    if(res.session){
                      this.getStudents(false);
                      this.dataProvider.showToast(res.message);
                    }else{
                      this.dataProvider.showToast(res.message); 
                      return false;
                    }
                  }).catch((err)=>{
                    this.dataProvider.hideLoading();
                    this.dataProvider.errorALertMessage(err);
                  })
                }else{
                  this.dataProvider.showToast(response.invalid_stu_id);
                  return false;
                }
              }
            }
          }
        ]
      })
      await alert.present();
  }

  editStudentClass(ev,student){
    let data = {
      "user_no": this.userDetails.details.user_no,
      "school_id": this.userDetails.details.school_id,
      "session_id": this.userDetails.session_id
    };
    this.dataProvider.showLoading();
    this.dataProvider.getCourses(data).then(response=>{
     this.dataProvider.hideLoading();
      if(response.session){
        this.dataProvider.editStudentClass(ev,student,response.data,data,res=>{
         // console.log('changed');
         this.showProfileModal=false;
          this.ngOnInit();
          //this.hideUserImageModal('')
        });
      }
    }).catch(error =>{
     this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(error);
    }) 
  }
}
