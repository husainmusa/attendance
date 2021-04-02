import { Component, OnInit, Input,NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {CreateClassPage } from '../create-class/create-class.page';

@Component({
  selector: 'app-manage-teacher',
  templateUrl: './manage-teacher.page.html',
  styleUrls: ['./manage-teacher.page.scss'],
})
export class ManageTeacherPage implements OnInit {
  course:any;
  userDetails:any;
  lang:any;
  navData:any;
  teacherList:any=[];
  noTeacher=false;
  selectedTeacher:any=[];
  trimmedTeacher:any=[];
  constructor(public navCtrl: NavController, 
             // public app: App, 
              public translate: TranslateService,
              public dataProvider: DataService, 
              public authProvider: AuthService,  
              //public events: Events,
              public alertCtrl: AlertController, 
              private route : ActivatedRoute,
              public zone:NgZone,
              private router:Router,
              public modalController: ModalController) {
              this.route.queryParams.subscribe(params => {
                if (this.router.getCurrentNavigation().extras.state) {
                     let isUpdated = this.router.getCurrentNavigation().extras.state.isUpdated;
                     if(isUpdated){
                       this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
                       this.getTeacher();
                     }
                }
              });
                this.translate.get("alertmessages").subscribe((res)=>{
                  this.lang = res;
                })
              
              }

  ngOnInit() {
    if(localStorage.getItem("userloggedin")){
           // console.log('logged in');
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.getTeacher();
    }
  }
  ionViewWillEnter(){
  }
  closeModal(){
  	this.modalController.dismiss({
      'dismissed': true
    });
  }

  getTeacher(){
    let data={
      'class_id':'',
      'school_id':this.userDetails.details.school_id,
      'user_no':this.userDetails.details.user_no
    }
    this.dataProvider.showLoading();
    this.dataProvider.getTeachers(data).then(res=>{
      this.dataProvider.hideLoading();
      console.log('teschers',res);
      if(res.session){
        this.teacherList=res.data;
        this.selectedTeacher=res.data;
        if(this.selectedTeacher.length > 1){
            this.trimmedTeacher = this.selectedTeacher.splice(0, 20);
          }else{
            this.trimmedTeacher = this.selectedTeacher;
          }
        if(res.data.length<1){
          this.noTeacher=true;
        }
      }else{
        this.noTeacher=true;
        console.log('err',res);
      }
    },error=>{
      this.noTeacher=true;
      this.dataProvider.hideLoading();
      console.log(error);
    })
  }

  doInfinite(infiniteScroll:any) {
    setTimeout(() => {
      this.trimmedTeacher = this.trimmedTeacher.concat(this.selectedTeacher.splice(0, 20));
      infiniteScroll.target.complete();
    }, 500);
  }

  openEditPage(teacher){
  	const navigation: NavigationExtras = {
    	state : {teacher:teacher}
    };
    this.zone.run(() => {
      this.router.navigate(['edit-teacher-profile'], navigation);
    });
  }




  markTeacher(teacher,type,eve,id){
    let is_checked= eve.srcElement.ariaChecked;
    console.log(teacher,type,id,is_checked);
    if(type=='reg'){
      if(is_checked!="true"){
           this.selectedTeacher[id].is_assign=1;
           this.selectedTeacher[id].assign_as="regular";
        let elem= <HTMLFormElement>(document.getElementById('spl'+id));
        elem.checked=false;
      }else{
           this.selectedTeacher[id].is_assign=2;
           this.selectedTeacher[id].assign_as=0;
       // this.popMarkedTeacher(data);
      }

    }else{
      if(is_checked!="true"){
           this.selectedTeacher[id].is_assign=1;
           this.selectedTeacher[id].assign_as="split";
        let elem= <HTMLFormElement>(document.getElementById('reg'+id));
        elem.checked=false;
      }else{
           this.selectedTeacher[id].is_assign=2;
           this.selectedTeacher[id].assign_as=1;
      }
    }
    console.log(this.selectedTeacher);
  }

  submitTeacher(){
      this.dataProvider.showLoading();
      let data={
        'teachersList':this.selectedTeacher,
        'class_id':this.course.cid,
        'school_id':this.userDetails.school_id,
        'user_no':this.userDetails.user_no
      }
      this.dataProvider.updateTeacher(data).then(res=>{
        this.dataProvider.hideLoading();
        console.log('teschers',res);
        if(res.session){
          this.dataProvider.showToast(res.data);
          this.router.navigate(['tabs/classlist']);
        }else{
         this.dataProvider.showToast(res.message);
        }
      },error=>{
         this.dataProvider.showToast(error);
        this.dataProvider.hideLoading();
        console.log(error);
      })
  }

  deletClass(){
    this.dataProvider.showLoading();
      let data={
        'class_id':this.course.cid,
        'school_id':this.userDetails.school_id,
        'user_no':this.userDetails.user_no
      }
      this.dataProvider.deleteClass(data).then(res=>{
        this.dataProvider.hideLoading();
        console.log('teschers',res);
        if(res.session){
          this.dataProvider.showToast(res.data);
          this.router.navigate(['tabs/classlist']);
        }else{
         this.dataProvider.showToast(res.message);
        }
      },error=>{
         this.dataProvider.showToast(error);
        this.dataProvider.hideLoading();
        console.log(error);
      })
  }

  filterList(event){
    //this.selectTopic=[];
    let input = (<HTMLInputElement>document.getElementById('search')).value;
     let data={
        'keyword':input,
        'school_id':this.userDetails.details.school_id,
        'pageno':0
      }
     this.dataProvider.searTeacher(data).then(res=>{
       console.log(res);
       if(res.data){
         let teacher=res.data.profile;
         console.log(teacher,this.selectedTeacher,this.teacherList);
         if(teacher.length > 0){
            this.trimmedTeacher = teacher.splice(0, 20);
          }else{
            this.trimmedTeacher = this.selectedTeacher.splice(0, 20);
          }
       }
     })

    // console.log(input);
    // const items = Array.from(document.getElementById('teacher').children);
    // items.forEach(item => {
    //       const shouldShow = item.textContent.toLowerCase().indexOf(input) > -1;
    //       (<HTMLElement>item).style.display = shouldShow ? 'block' : 'none';
    // });

  }

}
