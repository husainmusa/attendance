import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { CalendarComponentOptions } from 'ion2-calendar'

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit {
  showProfileModal: boolean = false;
  students: any = [];
  dateSelected: any;
  student: any = {};
  userDetails: any = {};
  showCalenderModal: boolean = false;
  attendanceSheet: any = {};
  userType: any;
  attMarkBegin: boolean = false;
  attNotMarked: boolean = true;
  lang: any = {};
  delayRule: number = 5;
  editMode: boolean = false;
  holidayString: string;
  currentEvents: any = [];
  isHoliday: boolean = false;
  noDataFound: string = '';
  studentBehaviour: string = '';
  courseInfo:any = {};
  navData:any;
    options = {
      canBackwardsSelected: true, //By making this true you can access the disabled dates
      from:1,
      to:0,
       disableWeeks: [],
    daysConfig : <any>[]
    };
    constructor(public navCtrl: NavController, 
		  //	public navParams: NavParams, 
		  	public dataProvider: DataService,
		    public authProvider: AuthService, 
		    //public app: App, 
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
	             console.log(this.navData);
		    if (localStorage.getItem("userloggedin")) {
		      this.dateSelected = new Date();
		      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
		      let data = {
		        "user_no": this.userDetails.details.user_no,
		        "school_id": this.userDetails.details.school_id,
		        "session_id": this.userDetails.session_id
		      };
		      this.dataProvider.getHolidays(data).then(response => {
		        if (response) {
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
              console.log(this.options.daysConfig)
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
		   //   this.app.getRootNav().setRoot("LoginPage");
		    }
	      }
	    });
       this.translate.get("alertmessages").subscribe((response) => {
	      this.lang = response;
	    })

  }
 
  ngOnInit() {
  }
   ionViewWillEnter() {
  }

  /**
   * get the list of students from provider
   */
  getStudents(loader:boolean = true) {
    if(loader) this.dataProvider.showLoading();
    this.userType = this.userDetails.details.user_type;
    let course = this.navData;
    this.courseInfo = course;
    let studentData = {
      "date": this.dataProvider.getFormatedDate(this.dateSelected),
      "user_no": this.userDetails.details.user_no,
      "session_id": this.userDetails.session_id,
      "course_id": course.cid,
      "school_id": this.userDetails.details.school_id
    }
    if(localStorage.getItem("delayclasslocalatt")){
      let attendance = JSON.parse(localStorage.getItem("delayclasslocalatt"));
      Object.keys(attendance).map((courseId)=>{
        if(!this.checkCurrentDate(new Date(attendance[courseId].date)) && localStorage.getItem("delayclasslocalatt")){
          localStorage.removeItem("delayclasslocalatt");
        }
      })
    }
    this.dataProvider.getDelayClassStudentList(studentData).then(res => {
      if(loader) this.dataProvider.hideLoading();
      if (res.session) {
        console.log('getDelayClassStudentList',res)
        let responseData = res.data;
        this.delayRule = parseInt(responseData.delay_rule);
        this.students = responseData.students;
        this.attMarkBegin = false;
        this.attendanceSheet = {};
        this.editMode = false;
        if (this.students.length == 0) {
          this.noDataFound = this.lang.no_students_in_class;
        }
        if(this.checkDateSelected(new Date())){
          if(localStorage.getItem("delayclasslocalatt")){
            let localAtt:any = {};
            localAtt = JSON.parse(localStorage.getItem("delayclasslocalatt"));
            responseData.date = this.dataProvider.getFormatedDate(this.dateSelected);
            localAtt[course.cid] = responseData;
            localStorage.setItem("delayclasslocalatt", JSON.stringify(localAtt));
          }else{
            let localAtt:any = {};
            responseData.date = this.dataProvider.getFormatedDate(this.dateSelected);
            localAtt[course.cid] = responseData;
            this.dataProvider.getFormatedDate(this.dateSelected)
            localStorage.setItem("delayclasslocalatt", JSON.stringify(localAtt));
          }
        }
      } else {
        if(loader) this.dataProvider.hideLoading();
        this.authProvider.flushLocalStorage();
        this.dataProvider.errorALertMessage(res.message);
        this.router.navigate(['login'],{replaceUrl:true});
      //  this.app.getRootNav().setRoot("LoginPage");
      }
    })
  }

  /**
  * Open student detail page
  * @param student_id Id of the student you want to see the details
  */
  openStudentDetail(student_id: string,student) {
         console.log('student',student);
    if(this.platform.is('cordova')){
      if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN){
        if (!this.attMarkBegin) {
        	const navigation: NavigationExtras = {
		      state : {
		         student_id: student_id,
	            course_id: this.navData.cid,
	            dateSelected: this.dataProvider.getFormatedDate(this.dateSelected),
              total_delay:student.total_delay
            }
		      };
		      //console.log(navigation);
		      this.zone.run(() => {
		        this.router.navigate(['student-detail'], navigation);
		      });
          // this.navCtrl.push("StudentDetailPage", {
          //   student_id: student_id,
          //   course_id: this.navParams.get("course").cid,
          //   dateSelected: this.dataProvider.getFormatedDate(this.dateSelected)
          // });
        } else {	
          this.dataProvider.showToast(this.lang.complete_att_submission);
        }
      }else{
        this.dataProvider.showToast(this.lang.no_internet);
      }
    }else{
      if (!this.attMarkBegin) {
      	const navigation: NavigationExtras = {
	      state : { student_id: student_id,
                  course_id: this.navData.cid,
                  dateSelected: this.dataProvider.getFormatedDate(this.dateSelected),
                  total_delay:student.total_delay
            }
	      };
	      //console.log(navigation);
	      this.zone.run(() => {
	        this.router.navigate(['student-detail'], navigation);
	      });
        // this.navCtrl.push("StudentDetailPage", {
        //   student_id: student_id,
        //   course_id: this.navParams.get("course").cid,
        //   dateSelected: this.dataProvider.getFormatedDate(this.dateSelected)
        // });
      } else {
        this.dataProvider.showToast(this.lang.complete_att_submission);
      }
    }
  }

  /**
   * Open image modal popup
   * @param student Object of student details to show in image popup
   */
  openUserImageModal(student: any) {
    if (!this.attMarkBegin) {
      this.student = student;
      if (student.agg_ranking > 0 && student.agg_ranking < 2.6) {
        this.studentBehaviour = this.lang.warning_behaviour;
      } else if (student.agg_ranking > 2.5 && student.agg_ranking < 3.6) {
        this.studentBehaviour = this.lang.good_behaviour;
      } else if (student.agg_ranking > 3.5 && student.agg_ranking < 4.6) {
        this.studentBehaviour = this.lang.very_good_behaviour;
      } else if (student.agg_ranking > 4.5 && student.agg_ranking < 5.1) {
        this.studentBehaviour = this.lang.excellent_behaviour;
      } else {
        this.studentBehaviour = this.lang.no_behaviour;
      }
      this.showProfileModal = true;
    } else {
      this.dataProvider.showToast(this.lang.complete_att_submission);
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
          let query2 = document.getElementsByName('md-arrow-dropdown');
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
          // date.setDate(event.date);
          // date.setMonth(event.month);
          // date.setFullYear(event.year);

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
   * Change the status of the attendance
   * @param student student object whose attendance is selected to change
   */
  changeAttendanceStatus(student: any) {
    if (!this.isHoliday) {
      if (this.userType == '1') {
        if (this.editMode) {
          if (student.suspend_leave || student.medical_leave) {
            this.dataProvider.showToast(this.lang.att_modification_error);
          } else {
            this.attMarkBegin = true;
            this.attNotMarked = false;
            if (student.sheet['cem-1']) { // present
              student.sheet['cem-1'] = false; // mark absent
              this.attendanceSheet['sid-' + student.sid] = '0';
            } else {
              student.sheet['cem-1'] = true; // mark present
              this.attendanceSheet['sid-' + student.sid] = '1';
            }
          }
        } else {
          this.dataProvider.showToast(this.lang.enable_edit);
        }
      } else if (this.userType == '3' && this.checkDateSelected(new Date())) {
        if (student.suspend_leave || student.medical_leave) {
          this.dataProvider.showToast(this.lang.att_modification_error);
        } else {
          this.attMarkBegin = true;
          this.attNotMarked = false;
          if (student.sheet['cem-1'] && this.userType != "1") { // present
            this.dataProvider.showToast(this.lang.att_already_marked);
          } else {
            student.sheet['cem-1'] = true; // mark present
            this.attendanceSheet['sid-' + student.sid] = '1';
          }
        }
      } else {
        this.dataProvider.showToast(this.lang.att_modification_error);
      }
    } else {
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
   * For enabling editing mode
   */
  enableEditingMode() {
    if (this.userType == '3' && this.checkDateSelected(new Date())) {
      this.editMode = true;
      this.dataProvider.showToast(this.lang.edit_mode_enabled);
    } else if (this.userType == '1') {
      this.editMode = true;
      this.dataProvider.showToast(this.lang.edit_mode_enabled);
    } else {
      this.dataProvider.showToast(this.lang.not_permission_to_enable);
    }
  }

  /**
   * Attendance submit function
   */
  submitAttendance() {
    if (this.attMarkBegin) {
      this.dataProvider.showLoading();
      let data: any = {};
      data.sheet = {};
      data.sheet["cem-1"] = {};
      data.user_no = this.userDetails.details.user_no;
      data.session_id = this.userDetails.session_id;
      data.cid = this.navData.cid;
      data.date = this.dataProvider.getFormatedDate(this.dateSelected);
      data.school_id = this.userDetails.details.school_id;
      Object.keys(this.attendanceSheet).map((key) => {
        data.sheet["cem-1"][key] = this.attendanceSheet[key];
      })
      let submittedByUser = 0;
      if (this.userType == '1') {
        submittedByUser = 1;
      } else if (this.userType == '3') {
        submittedByUser = 2;
      }
      console.log(data);
      if(this.platform.is('cordova')){
        if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN){
          this.dataProvider.markDelayAttendance(data, submittedByUser).then((response) => {
            this.dataProvider.hideLoading();
            if (response) {
              this.getStudents(false);
              this.router.navigate(['tabs/delaylist'],{replaceUrl:true})
            //  this.navCtrl.setRoot(TabsPage);
            }
          }).catch((error) => {
            this.dataProvider.hideLoading();
            this.dataProvider.errorALertMessage(error);
          })
        }else{
          this.dataProvider.hideLoading();
          if(localStorage.getItem("delayattendance")){
            let delayAttendance = JSON.parse(localStorage.getItem("delayattendance"));
            delayAttendance.push({attendance: data, submittedByUser: submittedByUser});
            localStorage.setItem("delayattendance", JSON.stringify(delayAttendance));
          }else{
            let delayAttendance = [];
            delayAttendance.push({attendance: data, submittedByUser: submittedByUser});
            localStorage.setItem("delayattendance", JSON.stringify(delayAttendance));
          }
          this.dataProvider.showToast(this.lang.offline_att_stored);
        }
      }else{
        this.dataProvider.markDelayAttendance(data, submittedByUser).then((response) => {
          this.dataProvider.hideLoading();
          if (response) {
            this.getStudents(false);
            this.router.navigate(['tabs/delaylist'],{replaceUrl:true})
            //this.navCtrl.setRoot(TabsPage);
          }
        }).catch((error) => {
          this.dataProvider.hideLoading();
          this.dataProvider.errorALertMessage(error);
        })
      }
    } else {
      this.dataProvider.showToast(this.lang.select_att_to_update);
    }
  }

  /**
   * alert to show image take choice
   */
  async takePicture() {
    if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN){
    const alert= await this.alertCtrl.create({
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
          imageData: 'data:image/png;base64,'+imageData,
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
          imageData: 'data:image/png;base64,'+imageData,
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

}
