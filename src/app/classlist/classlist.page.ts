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
  selector: 'app-classlist',
  templateUrl: './classlist.page.html',
  styleUrls: ['./classlist.page.scss'],
})
export class ClasslistPage implements OnInit {

  /**
   * @member classes Array of list of classes
   * @member userType user type of logged in user
   * @member editMode For checking whether the user has power to edit class name
   * @member classBackgroundColor used for background color of class
   * @member userDetails Contains the user details who is logged in from local storage
   * @member noDataFound used for diplaying the message when no child found
   * @member lang Contains the language translation object
   */
    @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
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
  reorderList:Array<any>=[];
  canReorder:boolean=true;
  showIcon:boolean=false;
  /**
   * Class list constructor
   * @param navCtrl Use for navigation between pages
   * @param app   Root app
   * @param dataProvider  Use for getting data from the API
   * @param authProvider  Use for authentication purpose
   * @param alertCtrl Ionic alert controller to show alert popup
   * @param translate used for translation service
   * @param modalCtrl modal controller to open create class
   */
  constructor(public navCtrl: NavController,
  	         // public app: App,
  	          public translate: TranslateService,
              public dataProvider: DataService,
              public authProvider: AuthService,
              //public events: Events,
              public alertCtrl: AlertController,
              private route : ActivatedRoute,
              public popoverController: PopoverController,
              public zone:NgZone,
              private router:Router,
              public modalCtrl: ModalController) {
        this.authProvider.event.subscribe((res)=>{
        //  console.log('change',res)
          if(res.changeUser){
            this.ngOnInit();
          }
        })
                this.translate.get("alertmessages").subscribe((res)=>{
                  this.lang = res;
                //  console.log(this.lang);
                })
                this.category="list";
                this.dataProvider.language.subscribe((resq)=>{
                  this.translate.get("alertmessages").subscribe((res)=>{
                     // console.log(this.lang);
                    this.lang = res;
                    this.ngOnInit(false);
                  })
                })
  }

  toogleReorder(){
    if(!this.canReorder){
      this.changeOrder();
    }
    this.canReorder= !this.canReorder;
  }
  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
    this.prepareArray(ev.detail.from,ev.detail.to);
    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    ev.detail.complete();
  }

  changeOrder(){

    let data={
      list:this.reorderList,
      user_no: this.userDetails.details.user_no,
      school_id: this.userDetails.details.school_id
    }
    // console.log('reorderData',data);
    if(this.reorderList.length){
      this.presentPopover();
      this.dataProvider.reorderClasses(data).then((res)=>{
        // console.log(res);
        this.dissmissPopOver();
        this.getCourse(false);
      }).catch((err)=>{
        console.log(err);
      })
    }
  }
  prepareArray(startfrom,endTo){

    if(!this.reorderList.length){
      this.classes.forEach((res,index)=>{
        this.reorderList.push({cid:res.cid,index:index})
      })
    }
    // console.log(this.classes);
    // console.log(data);
    if(startfrom<endTo){
      for (var i = startfrom; i <=endTo; i++) {
          this.reorderList[i].index--;
          // console.log(this.reorderList[i],i);
      }
      this.reorderList[startfrom].index=endTo;
    }
    if(startfrom>endTo){
      for (var i = endTo; i <=startfrom; i++) {
          this.reorderList[i].index++;
          // console.log(this.reorderList[i],i);/
      }
      this.reorderList[startfrom].index=endTo;
    }
    this.reorderList.sort(function(a, b) {
      var keyA = a.index,
        keyB =b.index;
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    console.log(this.reorderList);
    // this.changeOrder(this.reorderList);
  }

  toggleReorderGroup() {
    this.reorderGroup.disabled = !this.reorderGroup.disabled;
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
    this.editMode = false;
       // this.dataProvider.showLoading();
    if(localStorage.getItem("userloggedin")){
    //  console.log('logged in');
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType = this.userDetails.details.user_type;
      this.getCourse(loader);
      this.getTodayDeshboard(false);
    }else{
      this.dataProvider.hideLoading();
    //  console.log('not logged in');
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
      //this.app.getRootNav().setRoot("LoginPage");
    }
  }
  ionViewWillEnter(){
  }



  segmentChanged(event){
    if(this.canPresentPopover){
     this.presentPopover();
       const intervel= setInterval(()=>{
        if(!this.canPresentPopover){
          this.dissmissPopOver();
          clearInterval(intervel);
        }
      },500);
    }
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
        this.dataProvider.syncOffileData();
        let courses = response.data;
        if(response.linkData != undefined){
        	this.authProvider.piblisEvenetActiveLink(response.linkData);
          //this.events.publish("activeLink", response.linkData)
        }
        if(courses && courses.length > 0){
          let i = 0;
          this.classes = courses;
          this.reorderList=[];
          this.classes.forEach((course)=>{
            course.backgroundColor = this.classBackgroundColor[i];
            i++;
            if(i == 9) i = 0;
          })
        }else{
          this.noDataFound = this.lang.no_class_found;
          this.classes = [];
          this.reorderList=[];
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

  getTodayDeshboard(loader:boolean=true){
    let data = {
      "user_no": this.userDetails.details.user_no,
      "school_id": this.userDetails.details.school_id,
      "session_id": this.userDetails.session_id
    };
    this.canPresentPopover=true;
    this.dataProvider.todayDashboard(data).then(response=>{
      this.canPresentPopover=false;
      if(loader)this.dissmissPopOver();
      if(response.session){
          //this.dataProvider.syncOffileData();
          this.dashBoard=response.data.seminar;
        //    console.log('',this.dashBoard);
        }else{
         //  this.authProvider.flushLocalStorage();
         //  this.dataProvider.errorALertMessage(response.message);
         // this.router.navigate(['login'], { replaceUrl: true });
         // this.app.getRootNav().setRoot("LoginPage");
        }
    }).catch(error =>{
      this.canPresentPopover=false;
      if(loader) this.dissmissPopOver();
      this.dataProvider.hideLoading();
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
    if(this.editMode){
      if(this.userType==1){
        this.editClass(course);
      }else{
          const alert= await this.alertCtrl.create({
            header: this.lang.edit_title,
            message: this.lang.givecourse,
            backdropDismiss: false,
            inputs: [
              {
                type: "text",
                value: course.name,
                name: "courseName",
                placeholder: this.lang.enter_value_placeholder
              },
              {
                type: "text",
                value: course.desc,
                name: "courseDesc",
                placeholder: this.lang.enter_value_placeholder
              }
            ],
            buttons: [
              {
                text: this.lang.alert_btn_cancel_text,
                role: 'cancel',
              },
              {
                text: this.lang.alert_btn_submit_text,
                handler: (data)=>{
                  if((data.courseDesc && data.courseDesc.trim() != "") && (data.courseName && data.courseName.trim() != "")){
                    let postData = {
                      cid: course.cid,
                      user_no: this.userDetails.details.user_no,
                      session_id: this.userDetails.session_id,
                      course: {
                        name: data.courseName,
                        desc: data.courseDesc
                      }
                    }
                    this.dataProvider.updateCourseDesc(postData).then((response)=>{
                      if(response.session){
                        course.name = data.courseName
                        course.desc = data.courseDesc;
                        this.editMode = false;
                        return true;
                      }else{
                        this.authProvider.flushLocalStorage();
                        this.dataProvider.errorALertMessage(response.message);
                        this.router.navigate(['login'], { replaceUrl: true });
                       // this.app.getRootNav().setRoot("LoginPage");
                      }
                    }).catch((error)=>{
                      this.dataProvider.errorALertMessage(error);
                    })
                  }else{
                    this.dataProvider.showToast(this.lang.can_not_empty)
                  }
                }
              }
            ]
          })
         await alert.present();
      }
    }else{
      const navigation: NavigationExtras = {
        state : {course: course}
      };
      this.zone.run(() => {
        this.router.navigate(['list-student'], navigation);
      });
    }
  }

  openSeminar(seminar){
      const navigation: NavigationExtras = {
        state : {seminar: seminar}
      };
      this.zone.run(() => {
        this.router.navigate(['seminar-list'], navigation);
      });
  }

  /**
  *advance aditing like delete assign teacher
  */
 async editClass(course){
    const alert= await this.alertCtrl.create({
            header: this.lang.edit_title,
            message: this.lang.givecourse,
            backdropDismiss: false,
            cssClass:'editClassPopup',
            inputs: [
              {
                type: "text",
                value: course.name,
                name: "courseName",
                placeholder: this.lang.enter_value_placeholder
              },
              {
                type: "text",
                value: course.desc,
                name: "courseDesc",
                placeholder: this.lang.enter_value_placeholder
              }
            ],
            buttons: [
              {
                // text: this.lang.alert_btn_cancel_text,
                text: this.lang.alert_btn_cancel_text,
                role: 'cancel',
                cssClass:'btnfirst',
              },
              {
                text: this.lang.alert_btn_submit_text,
                cssClass:'btnsecond',
                handler: (data)=>{
                  if((data.courseDesc && data.courseDesc.trim() != "") && (data.courseName && data.courseName.trim() != "")){
                    let postData = {
                      cid: course.cid,
                      user_no: this.userDetails.details.user_no,
                      session_id: this.userDetails.session_id,
                      course: {
                        name: data.courseName,
                        desc: data.courseDesc
                      }
                    }
                    this.dataProvider.updateCourseDesc(postData).then((response)=>{
                      if(response.session){
                        course.name = data.courseName
                        course.desc = data.courseDesc;
                        this.editMode = false;
                        return true;
                      }else{
                        this.authProvider.flushLocalStorage();
                        this.dataProvider.errorALertMessage(response.message);
                        this.router.navigate(['login'], { replaceUrl: true });
                       // this.app.getRootNav().setRoot("LoginPage");
                      }
                    }).catch((error)=>{
                      this.dataProvider.errorALertMessage(error);
                    })
                  }else{
                    this.dataProvider.showToast(this.lang.can_not_empty)
                  }
                }
              },
              {
                text: this.lang.delete,
                cssClass:'btnthird',
                handler: (data)=>{
                   this.deletClass(course);
                }
              }
            ]
          })
         await alert.present();
  }

    deletClass(course){
      this.dataProvider.showLoading();
      let data={
        'class_id':course.cid,
        'school_id':this.userDetails.details.school_id,
        'user_no':this.userDetails.details.user_no
      }
      console.log(data);
      this.dataProvider.deleteClass(data).then(res=>{
        this.getCourse(false);
        this.dataProvider.hideLoading();
        console.log('teschers',res);
        if(res.session){
          this.dataProvider.showToast(res.data);
          this.router.navigate(['tabs/classlist']);
        }else{
         this.dataProvider.showToast(res.message);
        }
      },error=>{
    //     this.dataProvider.showToast(error);
        this.dataProvider.hideLoading();
        console.log(error);
      })
  }

  openSearchPage(){
     const navigation: NavigationExtras = {
      state : {userDetails:this.userDetails.details}
      };
      //console.log(navigation);
      this.zone.run(() => {
        this.router.navigate(['search-student'], navigation);
      });
  }

  /**
   * enable edit mode for admin
   */
  enableEditMode(){
    this.editMode = !this.editMode;
  }

  /**
   * Open create class modal
   */
 async createClass(){
     const modal = await this.modalCtrl.create({
       component: CreateClassPage,
        cssClass: 'my-custom-class',
        componentProps: {
          'firstName': 'Douglas',
          'lastName': 'Adams',
          'middleInitial': 'N'
        }
      });
   await modal.present();
    modal.onDidDismiss().then((refresh) => {
      if(refresh){
       // this.dataProvider.showLoading();
        this.getCourse();
      }
    })
  }
}
