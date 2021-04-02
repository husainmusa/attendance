import { Component, OnInit, Input,NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../../service/auth/auth.service';
import { DataService } from '../../service/data/data.service';
import { DatabaseService } from '../../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {CreateClassPage } from '../../create-class/create-class.page';

@Component({
  selector: 'app-edit-calss',
  templateUrl: './edit-calss.page.html',
  styleUrls: ['./edit-calss.page.scss'],
})
export class EditCalssPage implements OnInit {
  course:any;
  userDetails:any;
  lang:any;
  navData:any;
  teacherList:any=[];
  noTeacher=false;
  selectedTeacher:any=[];
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
                this.translate.get("alertmessages").subscribe((res)=>{
                  this.lang = res;
                })
              this.route.queryParams.subscribe(params => {
                if (this.router.getCurrentNavigation().extras.state) {
                     this.navData = this.router.getCurrentNavigation().extras.state;
                     this.course=this.navData.course;
                     this.userDetails=this.navData.userDetails;
                  //   console.log(this.navData);
                  console.log('data',this.course,'userfa',this.userDetails);
                  this.getTeacher();
                }
              });
              }

  ngOnInit() {
  }
  closeModal(){
  	this.modalController.dismiss({
      'dismissed': true
    });
  }

  getTeacher(){
    let data={
      'class_id':this.course.cid,
      'school_id':this.userDetails.school_id,
      'user_no':this.userDetails.user_no
    }
    this.dataProvider.showLoading();
    this.dataProvider.getTeachers(data).then(res=>{
      this.dataProvider.hideLoading();
      console.log('teschers',res);
      if(res.session){
        this.teacherList=res.data;
        this.selectedTeacher=res.data;
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


}
