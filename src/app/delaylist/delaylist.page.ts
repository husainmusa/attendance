import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import {LoaderComponent} from '../components/loader/loader.component';

@Component({
  selector: 'app-delaylist',
  templateUrl: './delaylist.page.html',
  styleUrls: ['./delaylist.page.scss'],
})
export class DelaylistPage implements OnInit {


  /**
   * @member classes Array of list of classes
   * @member userType user type of logged in user
   * @member editMode For checking whether the user has power to edit class name
   * @member classBackgroundColor used for background color of class
   * @member userDetails Contains the user details who is logged in from local storage
   * @member noDataFound used for diplaying the message when no child found
   * @member lang Contains the language translation object
   */
  classes:any = [];
  noDataFound:string = "";
  userType:any;
  editMode:boolean = false;
  lang:any = {};
  saveText:string;
  userDetails:any = {};
  classBackgroundColor = ["#ff7043", "#2962ff", "#43a047", "#6d4c41", "#ffab00", "#00b0ff", "#651fff", "#2962ff", "#d81b60", "#6a1b9a"]

popOver:any;

  /**
   * Class list constructor
   * @param navCtrl Use for navigation between pages
   * @param app   Root app
   * @param dataProvider  Use for getting data from the API
   * @param authProvider  Use for authentication purpose
   * @param alertCtrl Ionic alert controller to show alert popup
   * @param translate used for translation service
   */
  constructor(public navCtrl: NavController,
  			  //public app: App,
  			  public translate: TranslateService,
              public dataProvider: DataService,
              public authProvider: AuthService,
              private route : ActivatedRoute,
              public popoverController: PopoverController,
              public zone:NgZone,
              private router:Router,
              public alertCtrl: AlertController) {
        this.authProvider.event.subscribe((res)=>{
        //  console.log('change',res)
          if(res.changeUser){
            this.ngOnInit(false);
          }
        })
        this.dataProvider.language.subscribe((resq)=>{
          this.translate.get("alertmessages").subscribe((res)=>{
             // console.log(this.lang);
            this.lang = res;
          })
          this.ngOnInit(false);
        })

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
    if(this.popOver)this.popOver.dismiss();
  }

  ngOnInit(loader:boolean=true) {
    this.translate.get("alertmessages").subscribe((res)=>{
      this.lang = res;
    })
    if(loader) this.presentPopover()
   // this.dataProvider.showLoading();
    if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType = this.userDetails.details.user_type;
      let data = {
        "user_no": this.userDetails.details.user_no,
        "school_id": this.userDetails.details.school_id,
        "session_id": this.userDetails.session_id
      };
      this.dataProvider.getCourses(data).then(response=>{
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
            this.noDataFound = this.lang.no_class_found
          }
        }else{
          this.authProvider.flushLocalStorage();
          this.router.navigate(['login'], { replaceUrl: true });
          this.dataProvider.errorALertMessage(response.message);
       //   this.app.getRootNav().setRoot("LoginPage");
        }
      }).catch(error =>{
       if(loader)this.dissmissPopOver();
        this.dataProvider.errorALertMessage(error);
      })
    }else{
     this.dissmissPopOver();
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
    //  this.app.getRootNav().setRoot("LoginPage");
    }
  }

  ionViewWillEnter(){
    this.editMode = false;
  }

  /**
   * Open delay student list or open alert to edit class desc
   * @param course contains the course information
   */
async openClassStudents(course:any){
    if(this.editMode){
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
                  //  this.app.getRootNav().setRoot("LoginPage");
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
    }else{
      const navigation: NavigationExtras = {
        state : {course: course}
        };
        //console.log(navigation);
        this.zone.run(() => {
          this.router.navigate(['students'], navigation);
        });
   //   this.app.getRootNav().push("StudentsPage", {course: course});
    }
  }

  /**
   * enable edit mode for admin
   */
  enableEditMode(){
    this.editMode = !this.editMode;
  }
}
