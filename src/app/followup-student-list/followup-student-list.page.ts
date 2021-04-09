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
  selector: 'app-followup-student-list',
  templateUrl: './followup-student-list.page.html',
  styleUrls: ['./followup-student-list.page.scss'],
})
export class FollowupStudentListPage implements OnInit {
			showCalenderModal: boolean = false;
		  showProfileModal: boolean = false;
		  dateSelected: any;
		  noDataFound: string = "";
		  student: any = {};
		  userType: string;
		  attendanceResponse: any = {};
		  userDetails: any = {};
		  lang: any = {};
		  students: any = []; 
		  currentEvents: any = [];
		  holidayString: string = "";
		  isHoliday: boolean = false;
		  studentBehaviour:any = '';
		  courseInfo:any = {};
		  navData:any;
		  options = {
		    canBackwardsSelected: true, 
		    from:1,
		    to:0,
		   	disableWeeks: [],
		  	daysConfig : <any>[]
		  };
		  markSheet:any=[];
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

			this.route.queryParams.subscribe(params => {
		      if (this.router.getCurrentNavigation().extras.state) {
		      		 this.navData = this.router.getCurrentNavigation().extras.state.course;
               if(this.router.getCurrentNavigation().extras.state.update){
                 this.ngOnInit(false);
               }
		      }
	    });

	    this.dateSelected = new Date();
	    this.translate.get("alertmessages").subscribe((response) => {
			    this.lang = response;
	    })

  }

	ngOnInit(loader:boolean = true) {
		if (localStorage.getItem("userloggedin")) {
			this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
			this.userType = this.userDetails.details.user_type;
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
				console.log(error);
			})
			this.getStudents(loader);
	  } else {
	    this.dataProvider.hideLoading();
	    this.authProvider.flushLocalStorage();
	    this.router.navigate(['login'],{replaceUrl:true});
	  }
	}

	getStudents(loader:boolean = true) {
		this.markSheet=[];
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

    this.dataProvider.getFollowUpStudentList(studentData).then(res => {
      if(loader) this.dataProvider.hideLoading();
      if (res.session) {
        res.data.students.forEach((student)=>{
          student.studentBehaviour = this.getStudentBehaviour(student.agg_ranking);
        })
        this.attendanceResponse = res.data;
        
        this.students = JSON.parse(JSON.stringify(res.data.students));
        if (this.attendanceResponse.students && this.attendanceResponse.students.length == 0) {
          this.noDataFound = this.lang.no_students_in_class;
        }
      } else {
        if(loader) this.dataProvider.hideLoading();
        this.authProvider.flushLocalStorage();
        this.dataProvider.errorALertMessage(res.message);
        this.router.navigate(['login'],{replaceUrl:true});
      }
    })
	}

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

  changeMarks(eve,student,field){
    // console.log(field,eve);
    if((+eve.detail.value)> (+field.field_max_marks)){
      eve.detail.value=field.field_max_marks;
      eve.target.value='';
      this.dataProvider.showToast(this.lang.could_not_be_greater+field.field_max_marks);
      return;
    }
  	let isPresent=false;
  	let obj:any={};
  	obj.sid=student.sid;
  	obj.cid=student.cid;
    obj.marks_id=field.marks_id;
    obj.marks=eve.detail.value;
    obj.field_id=field.field_id;
  	if(this.markSheet.length>0){
	  	for (let i=0; i<this.markSheet.length; i++) {
	  		if(this.markSheet[i].sid==obj.sid && this.markSheet[i].cid==obj.cid && this.markSheet[i].field_id==field.field_id){
	  			this.markSheet[i]['marks']=eve.detail.value;
	  			isPresent=true;
	  		}
	  	}
	  	if(!isPresent){
  			this.markSheet.push(obj);
	  	}
  	}else{
  		this.markSheet.push(obj);
  	}
    // console.log('obj',obj);
  }

  submitMarks(){
  	let course = this.navData;
    console.log(course);
  	let data={
	      "date": this.dataProvider.getFormatedDate(this.dateSelected),
	      "user_no": this.userDetails.details.user_no,
	      "session_id": this.userDetails.session_id,
	      "course_id": course.cid,
	      "school_id": this.userDetails.details.school_id,
  	}

    console.log('this.markSheet',this.markSheet);
  	if(this.markSheet.length){
  		this.dataProvider.submitMarks(data,this.markSheet).then((response) => {
        this.dataProvider.hideLoading();
        if (response.session) {
          this.dataProvider.showToast(this.lang.marks_added);
          this.getStudents(false);
          this.router.navigate(['tabs/follow-up-student'],{replaceUrl:true});
        } else {
          this.router.navigate(['tabs/follow-up-student'],{replaceUrl:true});
          this.dataProvider.errorALertMessage(this.lang.marks_added_error);
        }
      }).catch((error) => {
        this.dataProvider.hideLoading();
        this.dataProvider.errorALertMessage(this.lang.marks_added_error);
      })
  	}else{
      this.dataProvider.showToast(this.lang.no_marks_added);
    }

  }



	checkCurrentDate(date: Date) {
	    let currentDate = new Date();
	    if (date.getDate() == currentDate.getDate() && date.getMonth() == currentDate.getMonth() && date.getFullYear() == currentDate.getFullYear()) {
	      return true;
	    } else {
	      return false;
	    }
	}
	openUserImageModal(student: any) {
      this.student = student;
      this.showProfileModal = true;
  }

  hideUserImageModal(event: any) {
    if (event.target.className == "custom-modal-main") {
      this.showProfileModal = false;
    }
  }

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
          let query2 = document.getElementsByClassName('arrow-dropdown');
          setTimeout(()=>{
            query[0]['name'] = "chevron-forward-outline";
            query1[0]['name']="chevron-back-outline";
            query2[0]['name']="chevron-down-outline";
          },500);
    }
  }
  hideCalenderModal() {
    this.showCalenderModal = false;
  }
  checkDateSelected(date: Date) {
    if (date.getDate() == this.dateSelected.getDate() && date.getMonth() == this.dateSelected.getMonth() && date.getFullYear() == this.dateSelected.getFullYear()) {
      return true;
    } else {
      return false;
    }
  }
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
          }
        }).catch((error) => {
          this.dataProvider.hideLoading();
          this.dataProvider.errorALertMessage(error);
        })
      }
    })
  }

  async presentPrintOption() {
    if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN){
     const alert=await this.alertCtrl.create({
        header: this.lang.report_option,
        buttons: [
          {
            text: this.lang.exel,
            handler: () => {
              this.printReport('exel');
            }
          },
          {
            text: this.lang.pdf,
            handler: () => {
              this.printReport('pdf');
            }
          }
        ]
      })
     await alert.present()
    }else{
      this.dataProvider.showToast(this.lang.no_internet);
    }
  }

	printReport(type){
    this.dataProvider.showLoading();
      let course = this.navData;
      this.courseInfo = course;
      let studentData = {
        "date": this.dataProvider.getFormatedDate(this.dateSelected),
        "user_no": this.userDetails.details.user_no,
        "session_id": this.userDetails.session_id,
        "course_id": course.cid,
        "school_id": this.userDetails.details.school_id,
        "report_type":type
      }

      this.dataProvider.getMarksReport(studentData).then(res => {
        this.dataProvider.hideLoading();
        if(res.data){
          if(type=="pdf"){
            let options: PrintOptions = { orientation: 'portrait'};
              this.printer.print(res.data,options).then((onSuccess:any)=>{
            },(e:any)=>{
                 console.log('printer.print',e)
                 this.dataProvider.showToast(this.lang.report_error);
            });
          }else{
            window.open(res.data, '_system');
          }
        }else{
          this.dataProvider.showToast(this.lang.report_error);
        }
    },error=>{
      this.dataProvider.hideLoading();
      this.dataProvider.showToast(this.lang.report_error);
    })
	}

  addFields(){
    let course = this.navData;
    const navigation: NavigationExtras = {
      state : {
        "date": this.dataProvider.getFormatedDate(this.dateSelected),
        "user_no": this.userDetails.details.user_no,
        "session_id": this.userDetails.session_id,
        "course_id": course.cid,
        "school_id": this.userDetails.details.school_id,
        course:this.navData
      }
    };
    this.zone.run(() => {
      this.router.navigate(['followup-add-fields'], navigation);
    });
  }

}
 