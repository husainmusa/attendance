import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-manage-student',
  templateUrl: './manage-student.page.html',
  styleUrls: ['./manage-student.page.scss'],
})
export class ManageStudentPage implements OnInit {
	userdata:any;
	lang:any;
	students=<any>[];
    allStudents=<any>[];
	searchtxt:any;
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
             let isUpdated = this.router.getCurrentNavigation().extras.state.isUpdated;
             if(isUpdated){
               this.userdata = JSON.parse(localStorage.getItem("userloggedin"));
               this.getStudents();
             }
        }
      });
  		 this.userdata = JSON.parse(localStorage.getItem("userloggedin"));
  		 //this.getStudents();
	    this.translate.get("alertmessages").subscribe((response) => {
	      this.lang = response;
	    })
	}

  ngOnInit() {
    this.userdata = JSON.parse(localStorage.getItem("userloggedin"));
    this.getStudents();
  }
  ionViewWillEnter(){
  }
  getStudents(){
  	let data={
  		'school_id':this.userdata.details.school_id
  	}
  	this.dataProvider.showLoading();
	this.dataProvider.getSchoolStudents(data).then(res => {
		this.dataProvider.hideLoading();
        console.log('seminar class',res);
        if(res.data){
        	this.students=res.data;
          if(this.students.length > 1){
            this.allStudents = this.students.splice(0, 20);
          }else{
            this.allStudents = this.students;
          }
        }
     
	}).catch(error=>{
		this.dataProvider.hideLoading();
		this.dataProvider.showToast(error);
		console.log(error)
	})
  }

    filterList(event){
    //this.selectTopic=[];
    let input = (<HTMLInputElement>document.getElementById('search')).value;
    let data={
      'school_id':this.userdata.details.school_id,
      'search_str':input
    }
    this.dataProvider.serachStudent(data).then(res => {
    //  this.dataProvider.hideLoading();
        if(res && res.data){

          if(res.data.response){
            this.students=res.data.response;
            console.log(this.students);
            if(this.students.length > 1){
              this.allStudents = this.students.splice(0, 20);
            }else{
              this.allStudents = this.students;
            }
          }
        }
    }).catch(error=>{
     // this.dataProvider.hideLoading();
      this.dataProvider.showToast(error);
      console.log(error)
    }) 


    // console.log(input);
    // const items = Array.from(document.getElementById('students').children);
    // items.forEach(item => {
    //       const shouldShow = item.textContent.toLowerCase().indexOf(input) > -1;
    //       (<HTMLElement>item).style.display = shouldShow ? 'block' : 'none';
    // });

  }

  openStudentDetails(student){  
    console.log(student);
  	const navigation: NavigationExtras = {
      state : {
	        student: student,
	        course_id: '',
	        dateSelected: this.dataProvider.getFormatedDate(new Date())
    	}
      };
      //console.log(navigation);
      this.zone.run(() => {
        this.router.navigate(['edit-student-profile'], navigation);
      });
  }
    doInfinite(infiniteScroll:any) {
    setTimeout(() => {
      this.allStudents = this.allStudents.concat(this.students.splice(0, 20));
      infiniteScroll.target.complete();
    }, 500);
  }

}
