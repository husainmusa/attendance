import { Injectable , EventEmitter} from '@angular/core';
import { HttpClient,HttpRequest,HttpEventType, HttpHeaders, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {Platform,LoadingController ,ToastController, AlertController ,ModalController ,NavController,PopoverController  } from '@ionic/angular';
//import { HttpParams, Http, Headers } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';
import { DatabaseService } from '../database/database.service';
//import { TranslateService } from '@ngx-translate/core';
import { SQLite } from '@ionic-native/sqlite/ngx';
// import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import {LoaderComponent} from '../../components/loader/loader.component';
import {RateAppComponent} from '../../components/rate-app/rate-app.component';
import { TranslateService } from '@ngx-translate/core';
import {SwitchAccountComponent} from '../../components/switch-account/switch-account.component';
import {EditStudentProfileComponent} from '../../components/edit-student-profile/edit-student-profile.component';
//import { EditCalssPage } from '../../common-modal/edit-calss/edit-calss.page';
// import { ViewClassNotesPage } from '../../common-modal/view-class-notes/view-class-notes.page';
import { AppRate } from '@ionic-native/app-rate/ngx';
import { BehaviorSubject } from 'rxjs';
import { tap, map,last } from 'rxjs/operators';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

import { StudentDataService } from '../student-data/student-data.service';

const env = environment; 

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public events: EventEmitter<any>;
  public language: EventEmitter<any>;
  public selectedUsers: EventEmitter<any>;
  loader: any;
  lang: any = {};
  syncInterval: any;
  mediaDirectory: string = '';
  popOver:any;
  public uploadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  /**
    * Represents a Data provider from API.
    * @constructor
    * @param {Http} http - for making http request.
    * @param {AlertController} alertCtrl - Alert popup.
    * @param {LoadingController} loadingCtrl - Loading popup.
    * @param {ToastController} toastCtrl - show toast
  */
  constructor(public httpClient: HttpClient,
  	public http: HttpClient,
  	public alertCtrl: AlertController,
  	public platform: Platform,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public translate: TranslateService,
    public modalController: ModalController,
    public network: Network,
    public popoverController: PopoverController,
    public dbProvider: DatabaseService,
    private file:File,
    public studentService:StudentDataService,
    private transfer: FileTransfer,
    private filePath: FilePath,
    private appRate: AppRate,
    public diagnostic:Diagnostic,
    // public photoLibrary: PhotoLibrary
    ) {
    this.events = new EventEmitter();
    this.language = new EventEmitter();
    this.selectedUsers = new EventEmitter();
    this.platform.ready().then(() => {
      setTimeout(res=>{
         this.translate.get("alertmessages").subscribe((res)=>{
                this.lang = res;
                // console.log(this.translate.instant('alertmessages'))
        })
      },2000)
    });
    this.language.subscribe(res=>{
      console.log('res>>>>',res);
      environment.lang_code=res;
    })
  }

  /**
   * This is a user rating popup
   * @return rating in int
   * @param ev - event
   */
    async presentRatingPopover(lang,note,callback:any) {
      // console.log('call');
      const popover = await this.popoverController.create({
        component: RateAppComponent,
       // event: ev,
        translucent: false,
        mode:"ios",
        cssClass:'ratePopup',
        backdropDismiss:false,
        componentProps:{lang:lang,data:note}
      });
      await popover.present();
      popover.onDidDismiss().then((response) => {
          // console.log('call',response);
          if(response.data){
            callback(response.data);
          }else{
            callback(false);
          }
      });
    }

    async editClassModal(course:any,callback:any){
      console.log(course);
      //   const modal = await this.modalController.create({
      //   component: EditCalssPage,
      //   cssClass: 'my-custom-class',
      //   componentProps: {couerse:course}
      // });
      // await modal.present();
      // modal.onDidDismiss().then(res=>{
      //   callback(res);
      // })
    }

  async  viewNotes(data,state){
      //   const modal = await this.modalController.create({
      //   component: ViewClassNotesPage,
      //   cssClass: 'my-custom-class',
      //   componentProps: {data:data,state:state}
      // });
      // await modal.present();
  }

    /**
    * submit rating to playstore
    * @param rating - int rating value
    */
    submitRating(rating){
      console.log(rating);
    }

      showRatePrompt(lang){
         this.appRate.preferences = {
              ...this.appRate.preferences,
              storeAppURL:{
                ios: '< my_app_id >',
                android: 'market://details?id=com.webapp.attendance'
              },
              simpleMode: true,
              useLanguage:lang,
              callbacks:{
                onRateDialogShow: function(callback) {
                  console.log('User Prompt for Rating');
                },
                onButtonClicked: function(buttonIndex){
                  console.log('Selected Button Index',buttonIndex);
                }
              }
            }
            // this.appRate.preferences.openUrl = function(url) {
            // window.open(url, '_system', 'location=yes');
            // };
        this.appRate.promptForRating(true);
   }

   async switchAccount(ev,lang){
      const popover = await this.popoverController.create({
        component: SwitchAccountComponent,
       // event: ev,
        translucent: false,
       // mode:"ios",
        cssClass:'switch-account',
        backdropDismiss:true,
        componentProps:{lang:lang}
      });
      await popover.present();
      popover.onDidDismiss().then((response) => {
         // console.log('call',response);
          // if(response.data){
          //   this.submitRating(response.data)
          // }else{
          //   this.showToast(lang.no_rating);
          // }
      });
    }
    async editStudentClass(ev,student,classes,user,callback:any){
      const popover = await this.popoverController.create({
        component: EditStudentProfileComponent,
        event: ev,
        translucent: false,
        mode:"ios",
        cssClass:'edit-student',
        backdropDismiss:true,
        componentProps:{student:student,classes:classes}
      });
      await popover.present();
      popover.onDidDismiss().then((response) => {
        // console.log('call',response);
         if(response.data){
           if(response.data.deleteClass){
             let deleteData={
               sid:response.data.student.sid,
               cid:response.data.student.cid,
              user_no: user.user_no,
              school_id: user.school_id,
              session_id: user.session_id
             }
             this.deleteStudentClass(deleteData,res=>{
               callback(res);
             });
           }else{
             let updateData={
               sid:response.data.student.sid,
               cid:response.data.student.cid,
               student_name:response.data.studentName,
                class_id:response.data.studentSemester,
                user_no: user.user_no,
                school_id: user.school_id,
                session_id: user.session_id
             }
             this.updateStudentProfile(updateData,res=>{
               callback(res);
             });
           }
         }
      });
    }


    deleteStudentClass(data, callback:any){
      console.log('delete',data)
      this.postRequest(data, 'deleteStudentClass').then((response: any) => {
        if (response) {
          this.showToast(response.msg);
          callback(response);
        }
      }).catch((error) => {
        console.log(error);
          //this.showToast(response.message);
      })
    }

    deleteStudent(data, callback:any){
      console.log('delete',data)
      this.postRequest(data, 'deleteStudent').then((response: any) => {
        if (response) {
          this.showToast(response.msg);
          callback(response);
        }
      }).catch((error) => {
        console.log(error);
          //this.showToast(response.message);
      })
    }
    deleteTeacher(data, callback:any){
      console.log('delete',data)
      this.postRequest(data, 'deleteTeacher').then((response: any) => {
        if (response) {
          this.showToast(response.msg);
          callback(response);
        }
      }).catch((error) => {
        console.log(error);
          //this.showToast(response.message);
      })
    }
    deleteParent(data, callback:any){
      console.log('delete',data)
      this.postRequest(data, 'deleteParent').then((response: any) => {
        if (response) {
          this.showToast(response.msg);
          callback(response);
        }
      }).catch((error) => {
        console.log(error);
          //this.showToast(response.message);
      })
    }
    deleteNote(data, callback:any){
      console.log('delete',data)
      this.postRequest(data, 'deleteNotes').then((response: any) => {
        if (response) {
          this.showToast(response.msg);
          callback(response);
        }
      }).catch((error) => {
        console.log(error);
          //this.showToast(response.message);
      })
    }
    updateStudentProfile(data, callback:any){
      console.log('update',data)
      this.postRequest(data, 'updateStudentProfile').then((response: any) => {
        if (response) {
          callback(response);
          this.showToast(response.msg);
        }
      }).catch((error) => {
        console.log(error);
          //this.showToast(response.message);
      })
    }

    updateTeacherProfile(data, callback:any){
      console.log('update',data)
      let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
           data.lang_code = environment.lang_code;
           let body = new HttpParams();
           Object.keys(data).forEach(function (key) {
              body = body.append(key, data[key]);
          });
          body['class']=[];
           Object.keys(data.class).map((key) => {
            Object.keys(data.class[key]).map((sid) => {
              body=body.append('classes'+'['+ key+']'+'['+sid+']' , data.class[key][sid]);
            })
          })

      this.httpClient.post( env.serverURL + 'updateTeacherProfile',body, { headers: header }).subscribe((response: any) => {
        if (response) {
         console.log('tescherList',response);
          if (response.response==false) {
            callback({ session: false, message: response.msg });
          } else if (response.response==true) {
           // this.dbProvider.insertClasses(response.courses);
            callback({ session: true, data: response.msg});
          } else {
            callback(response.msg)
          }
        } else {
        }
      },(error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          callback(error.message)
        } else {
          callback(this.lang.usnexpectedError)
        }
      });
    }


  /**
   * This is a user defined loader
   * @param ev - event
   */
  async presentPopover(ev:any) {
    this.popOver = await this.popoverController.create({
      component: LoaderComponent,
      backdropDismiss:true,
      //event: ev,
      translucent: false,
     // animated:true,
      cssClass:'loaderStyle'
     // mode:"ios"
    });
    return await this.popOver.present();
  }


  closePopup(){
    if(this.popOver)this.popOver.dismiss();
  }
  /**
   * This is a toast message function
   * @param message - string of message to be shown
   */

  async showToast(message: string) {
     const alert = await this.toastCtrl.create({
      message: message,
      position: 'bottom',
      duration: 3000
    })
    await alert.present();
  }

  /** ALert message popup.
   * @param {String} error - Error message to display
  */
  async errorALertMessage(error: string) {
    const alert = await this.alertCtrl.create({
      header: 'تحذير',
      message: error,
      backdropDismiss: false,
      buttons: ['Ok']
    })
     await alert.present();
  }

  /** ALert message popup.
   * @param {String} error - Error message to display
  */
  async msgALertMessage(msg: string) {
    const alert = await this.alertCtrl.create({
      header: 'معلومات',
      message: msg,
      backdropDismiss: false,
      buttons: ['Ok']
    })
    await alert.present();
  }

  /** Show Loading popup. */
  async showLoading() {
    this.presentPopover('');
  }

  /** Hide loading popup. */
  async hideLoading() {
  	setTimeout(res=>{
       this.closePopup();
    	// this.loader.dismiss();
  	},1000)
  }
  /** Search all user from API.
   * @returns Array of users list or error
  */

  searchUser(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'search_user').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }  
  searchAllUser(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'search_user_all').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  markBulletinRead(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'markBulletinRead').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  deleteBulletin(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'delete_bulletins').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  closeBulletin(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'closed_bulletins').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  reOpenBulletin(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'reOpenBulletin').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  getBulletinDetails(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'bulletins_details').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }  
  getStudentReports(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getStudentReports').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response.response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  submitStudentReports(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'submitStudentReports').then((response: any) => {
        if (response.success) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  removeStudentReportByType(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'removeStudentReportByType').then((response: any) => {
        if (response.success) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  printAllReports(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'printAllReports').then((response: any) => {
        if (response.success) {
            resolve({ session: true, data: response.response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }

  getBulletins(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getBulletins').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response.response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  editAbsentNotes(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'editAbsentNotes').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response,message:response.mg});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
  shareBulletins(data): Promise<any> {
    return new Promise((resolve, reject) => {
       let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          data.lang_code = environment.lang_code;
          let body: HttpParams = this.makeObjectToUrlParams(data);

           Object.keys(data.users).map((key) => {
             console.log('key',key);
              body=body.append('shareto_user_no'+'['+ key+']' , data.users[key]);
          })
              // console.log(body);

      this.httpClient.post( env.serverURL + 'shareBulletins',body, { headers: header }).subscribe((response: any) => {
        if (response) {
            resolve({ session: true, data: response.response,message:response.msg});
        } else {
            reject(response.msg)
        }
      },(error) => {
        console.log(error);
      });
      // console.log(data);
      // this.postRequest(data, 'shareBulletins').then((response: any) => {
      //   if (response) {
      //       resolve({ session: true, data: response.response,message:response.msg});
      //   } else {
      //       reject(response.msg)
      //   }
      // }).catch((error) => {
      //   console.log(error);
      // })
    })
  }

  commentBulletins(data): Promise<any> {
    return new Promise((resolve, reject) => {
       let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          data.lang_code = environment.lang_code;
          let body: HttpParams = this.makeObjectToUrlParams(data);

      this.httpClient.post( env.serverURL + 'commentBulletins',body, { headers: header }).subscribe((response: any) => {
        if (response) {
            resolve({ session: true, data: response.response,message:response.msg});
        } else {
            reject(response.msg)
        }
      },(error) => {
        console.log(error);
      });
    })
  }
    /** Search all student of School from API.
   * @returns Array of users list or error
  */

  serachStudent(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'search_student').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }

  searTeacher(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getTeacherWithPagging').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }
      /** Search all parent of School from API.
   * @returns Array of users list or error
  */

  serachParent(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'serachParent').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response.response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
      })
    })
  }

  /** Get school list from API.
   * @returns Array of school list or error
  */
  getSchool(country_code): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          let url=env.serverURL + 'getSchoolsHavingMaterials/' + ( (country_code && typeof country_code !=='undefined') ? '?country_code='+country_code  : '');
          this.httpClient.post(url,country_code, { headers: header }).subscribe((response: any) => {
            if (response.success) {
              resolve(response.schools);
            } else {
              reject("Server is not responding")
            }
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }
    /** Get teacher list of a perticular school  from API.
   * @returns Array of teacher list or error
  */
  getTeachers(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getAllTeachers').then((response: any) => {
        if (response) {
         console.log('tescherList',response);
          if (response.response==false) {
            resolve({ session: false, message: response.msg });
          } else if (response.response==true) {
           // this.dbProvider.insertClasses(response.courses);
            resolve({ session: true, data: response.profile});
          } else {
            reject(response.msg)
          }
        } else {
          // this.dbProvider.getClasses().then((classes) => {
          //   resolve({ session: true, data: classes });
          // }).catch((error) => {
          //   reject(error);
          // })
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  /** update teacher list of a perticular class of a school .
   * @returns updation status
  */
  updateTeacher(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      data.lang_code = environment.lang_code;
       let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
           let body = new HttpParams();
          body= body.append("class_id", data.class_id);
          body= body.append("school_id", data.school_id);
          body= body.append("user_no", data.user_no);
          body= body.append("lang_code", data.lang_code);
          body['teachersList']=<any>[];
          let obj=[];
          for (let i = 0; i < data.teachersList.length; i++) {
            // code...
          }
           Object.keys(data.teachersList).map((key) => {
             console.log('key',key);
            Object.keys(data.teachersList[key]).map((sid) => {
             console.log('ap',sid);
              body=body.append('teachersList'+'['+ key+']'+'['+sid+']' , data.teachersList[key][sid]);
            })
          })
              // console.log(body);

      this.httpClient.post( env.serverURL + 'updateTeachers',body, { headers: header }).subscribe((response: any) => {
        if (response) {
         console.log('tescherList',response);
          if (response.response==false) {
            resolve({ session: false, message: response.msg });
          } else if (response.response==true) {
           // this.dbProvider.insertClasses(response.courses);
            resolve({ session: true, data: response.msg});
          } else {
            reject(response.msg)
          }
        } else {
          // this.dbProvider.getClasses().then((classes) => {
          //   resolve({ session: true, data: classes });
          // }).catch((error) => {
          //   reject(error);
          // })
        }
      },(error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      });
    })
  }
  /** update teacher list of a perticular class of a school .
   * @returns updation status
  */
  createBulletins(data){

    let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          data.lang_code = environment.lang_code;
    let req = new HttpRequest('POST', env.serverURL + 'createBulletins', data, {
      responseType: 'arraybuffer',
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map(event => this.getStatusMessage(event)),
      tap(message => message),
      last()
    );


  }  
  createclassNotes(data){
    let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          data.lang_code = environment.lang_code;
    let req = new HttpRequest('POST', env.serverURL + 'createNotes', data, {
      responseType: 'arraybuffer',
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map(event => this.getStatusMessage(event)),
      tap(message => message),
      last()
    );


  }
    getStatusMessage(event){

    let status;
        switch(event.type){

          case HttpEventType.UploadProgress:
            status = Math.round(100 * event.loaded / event.total);
            this.uploadProgress.next(status);
            this.events.emit(status);
            return status;

          case HttpEventType.Response:
            return `Done`;
    }
  }
  // createBulletins(data): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //       // console.log(data['FormData']);
  //      let header = new HttpHeaders();
  //         header.append('Content-Type', 'application/json');
  //        //   let body = new HttpParams();
  //        // body= body.append("title", data.title);
  //        // body= body.append("school_id", data.school_id);
  //        // body= body.append("user_no", data.user_no);
  //        // body['files']=<any>[];
  //        //   Object.keys(data.files).map((key) => {
  //        //     console.log('key',key);
  //        //       Object.keys(data.files[key]).map((k) => {
  //        //         console.log('key',key);
  //        //          body=body.append('files'+'['+ key+']'+'['+k+']', data.files[key][k]);
  //        //      })
  //        //  })
  //        //       console.log(body);

  //     this.httpClient.post( env.serverURL + 'createBulletins',data, { headers: header }).subscribe((response: any) => {
  //       if (response) {
  //        console.log('tescherList',response);
  //          if (response.success==true) {
  //           resolve({ session: true, data: response.msg});
  //         } else {
  //           reject(response.msg)
  //         }
  //       } else {
  //       }
  //     },(error) => {
  //       console.log(error);
  //       if (error.message != undefined && error.message != '' && error.message != null) {
  //         reject(error.message)
  //       } else {
  //         reject(this.lang.usnexpectedError)
  //       }
  //     });
  //   })
  // }

  /** delete a class from a school.
   * @returns status of deletion
  */
  deleteClass(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'deleteClass').then((response: any) => {
        if (response) {
         console.log('tescherList',response);
          if (response.response==false) {
            resolve({ session: false, message: response.msg });
          } else if (response.response==true) {
           // this.dbProvider.insertClasses(response.courses);
            resolve({ session: true, data: response.msg});
          } else {
            reject(response.msg)
          }
        } else {
          // this.dbProvider.getClasses().then((classes) => {
          //   resolve({ session: true, data: classes });
          // }).catch((error) => {
          //   reject(error);
          // })
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  openPdf(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'check_user_plan').then((response: any) => {
        if (response) {
          if(response.response){
            resolve(response);
          }else{
            reject(response);
          }
        } else {
            reject(response);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  openStudentReport(url): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
      this.http.get(url, { headers: header }).subscribe((res)=>{
        resolve(res);
      },e=>{
        resolve(e);
      })
    })
  }
  getPlan(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getPlan').then((response: any) => {
        if (response) {
          if(response.response){
            resolve(response);
          }else{
            reject(response);
          }
        } else {
            reject(response);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  getUserPlan(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getUserPlan').then((response: any) => {
        if (response) {
          if(response.response){
            resolve(response);
          }else{
            reject(response);
          }
        } else {
            reject(response);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  } 

  registerTeacher(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'createNewTeacher').then((response: any) => {
        if (response) {
          if(response.response){
            resolve(response);
          }else{
            reject(response.msg);
          }
        } else {
            reject(response);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }  
  subscribePlan(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'subscribe_plans').then((response: any) => {
        if (response) {
          if(response.response){
            resolve(response);
          }else{
            reject(response);
          }
        } else {
            reject(response);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  purchase(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'purchase').then((response: any) => {
        if (response) {
          if(response.response){
            resolve(response);
          }else{
            reject(response);
          }
        } else {
            reject(response);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** Get parent list of a perticular school who recently registered on app  from API.
   * @returns Array of parent list or error
  */
  getRequestedParents(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getNewParents').then((response: any) => {
        if (response) {
         console.log('tescherList',response);
          if (response.response==false) {
            resolve({ session: false, message: response.msg });
          } else if (response.response==true) {
           // this.dbProvider.insertClasses(response.courses);
            resolve({ session: true, data: response.parents});
          } else {
            reject(response.msg)
          }
        } else {
          // this.dbProvider.getClasses().then((classes) => {
          //   resolve({ session: true, data: classes });
          // }).catch((error) => {
          //   reject(error);
          // })
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  getAllParents(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getAllParents').then((response: any) => {
        if (response) {
            resolve({ session: true, data: response.response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  /** take action on requested registered parents.
   * @returns status of action
   * @param parent id
   * @param school id

  */

  acceptRequestedParents(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'acceptParentRequest').then((response: any) => {
        if (response) {
          if (response.response==false) {
            resolve({ session: false });
          } else {
            resolve({ session: true });
          }
        } else {
          reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  changeParentStatus(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'changeParentStatus').then((response: any) => {
        if (response) {
          if (response.response==false) {
            resolve({ session: false,msg:response.msg });
          } else {
            resolve({ session: true,msg:response.msg });
          }
        } else {
          reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
    /** delete requested registered parents.
   * @returns status of action
   * @param parent id
   * @param school id

  */
  deleteRequestedParents(data): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'deleteParentRequest').then((response: any) => {
        if (response) {
          if (response.response==false) {
            resolve({ session: false });
          } else {
            resolve({ session: true });
          }
        } else {
          reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }


  /** Get E-Learning categories list from API.
  * @returns Array of category list or error
 */
  getElearningMaterials(schoolId: any,country_code): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');

          let url=env.serverURL + 'getElearningMaterials/'+ schoolId + ( (country_code && typeof country_code !=='undefined') ? '?country_code='+country_code  : '');
          this.httpClient.get(url, { headers: header }).subscribe((response: any) => {
            if (response.success) {
              resolve(response.materials);
            } else {
              reject("Server is not responding")
            }
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }
  getShareLink(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');

          let url=env.serverURL + 'getAppShareLink?'+'lang=en' ;
          this.httpClient.get(url, { headers: header }).subscribe((response: any) => {
            if (response) {
              resolve(response);
            } else {
              reject("Server is not responding")
            }
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /** Get E-Learning material data from API.
    * @returns Array of material data or error
   */
  getMaterialDetails(materialId: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          this.httpClient.get(env.serverURL + 'getMaterialDetails/' + materialId, { headers: header }).subscribe((response: any) => {
            if (response.success) {
              resolve(response.material);
            } else {
              reject("Server is not responding")
            }
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /** Get ads on login page.
   * @returns Array of ads or error
  */
  getAds(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          this.httpClient.get(env.serverURL + 'getAds', { headers: header }).subscribe((response: any) => {
            resolve(response);
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          resolve(false);
        }
      })
    })
  }

  /** Get news from API for news page.
   * @returns Array of news or error
  */
  getNews(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          this.httpClient.get(env.serverURL + 'getNews', { headers: header }).subscribe((response: any) => {
            if (response.success) {
              resolve(response.news);
            }
            resolve(response);
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /** Get news from API with paging.
   * @param {number} start - starting point of news list
   * @param {number} newsPerPage - how many news in one page
   * @param {object} userDeatils logged in user details
   * @param {char} countrycode - to get news of current locaion
   * @returns Array of News as per location or error
  */
  getNewsJoin(start: number, newsPerPage: number, userDeatils: any,countryCode): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          let url = '';

          if (userDeatils) {
            url = env.serverURL + 'getNewsjoin/' + start + '/' + newsPerPage + '/desc/' + userDeatils.user_no;
          } else {
            url = env.serverURL + 'getNewsjoin/' + start + '/' + newsPerPage + '/desc';
          }
          if(countryCode && typeof countryCode !=='undefined'){
             url= url+'?code='+countryCode;
          }

          this.httpClient.get(url, { headers: header }).subscribe((response: any) => {
            if (response.success) {
              if (response.news.length > 20) {
                this.dbProvider.insertNews(response.news.slice(0, 20));
              } else {
                this.dbProvider.insertNews(response.news);
              }
              resolve(response.news);
            }
            resolve(response);
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          this.dbProvider.getNews().then((news) => {
            resolve(news);
          }).catch((err) => {
            reject(err);
          })
        }
      })
    })
  }

  /**
   * Like the news post
   * @param data user_no, news_id, session_id
   */
  likeNewsPost(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'likeNewsPost').then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, message: response.msg });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Dislike the news post
   * @param data user_no, news_id, session_id
   */
  dislikeNewsPost(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'dislikeNewsPost').then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, data: response.courses });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** Get courses from API to show on classlist page.
   * @param {Object} data - contains user_no, school_id, session_id
   * @returns list of courses or error
  */
  getCourses(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
    	// console.log(data);
      this.postRequest(data, 'getCourses/' + data.school_id).then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            this.dbProvider.insertClasses(response.courses);
            resolve({ session: true, data: response.courses, linkData: response.activeLink });
          } else {
            reject(response.msg)
          }
        } else {
          this.dbProvider.getClasses().then((classes) => {
            resolve({ session: true, data: classes });
          }).catch((error) => {
            reject(error);
          })
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  } 

   /** Get courses from API to show on classlist page.
   * @param {Object} data - contains user_no, school_id, session_id
   * @returns list of courses or error
  */
  getTeachersClass(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getTeachersClass/' + data.school_id).then((response: any) => {
        if (response) {
           if (response.success) {
            resolve({ session: true, data: response.courses});
          } else {
            reject(response.msg)
          }
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
    /** Get follow up fields.
   * @param {Object} data - contains user_no, school_id, session_id
   * @returns list of courses or error
  */
  getFollowupFields(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getFollowupFields').then((response: any) => {
        if (response) {
           if (response.success) {
            resolve({ session: true, data: response.result});
          } else {
            reject(response.msg)
          }
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
    /** delete fields.
   * @param {Object} data - contains user_no, school_id, session_id
   * @returns list of courses or error
  */
  deleteFollowupFields(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'deleteFollowupFields').then((response: any) => {
        if (response) {
           if (response.success) {
            resolve({ session: true, data: response.result});
          } else {
            reject(response.msg)
          }
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

    getSelectedCourses(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getSelectedCourses/' + data.school_id).then((response: any) => {
        if (response) {
           if (response.success) {
            resolve({ session: true, data: response.selectedCourses});
          } else {
            reject(response.msg)
          }
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  /** Get courses from API to show on classlist page.
   * @param {Object} data - contains user_no, school_id, session_id
   * @returns list of courses or error
  */
  setTeachersClass(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
           let body = new HttpParams();
           data.lang_code = environment.lang_code;
           Object.keys(data).forEach(function (key) {
              body = body.append(key, data[key]);
          });
          // body['updates']=[];
           Object.keys(data.updates).map((key) => {
            Object.keys(data.updates[key]).map((sid) => {
              body=body.append('courcesData'+'['+ key+']'+'['+sid+']' , data.updates[key][sid]);
            })
          })
      this.httpClient.post( env.serverURL + 'setTeachersClass/'+ data.school_id,body, { headers: header }).subscribe((response: any) => {
        if (response) {
         console.log('tescherList',response);
          if (response.response==false) {
            resolve({ session: false, message: response.msg });
          } else if (response.response==true) {
            resolve({ session: true, data: response.msg});
          } else {
            resolve(response.msg)
          }
        } else {
        }
      },(error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      });
    })
  }


    /** set inpu5t field for follow up student.
   * @param {Object} data - contains user_no, school_id, session_id
   * @returns list of courses or error
  */
  saveFollowupFields(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
           let body = new HttpParams();
           data.lang_code = environment.lang_code;
           Object.keys(data).forEach(function (key) {
             if(key != 'field') body = body.append(key, data[key]);
          });
          // body['updates']=[];
           Object.keys(data.field).map((key) => {
            Object.keys(data.field[key]).map((sid) => {
              body=body.append('field'+'['+ key+']'+'['+sid+']' , data.field[key][sid]);
            })
          })
      this.httpClient.post( env.serverURL + 'saveFollowupFields',body, { headers: header }).subscribe((response: any) => {
        if (response) {
         console.log('tescherList',response);
          if (response.success==false) {
            resolve({ session: false, message: response.msg });
          } else if (response.success==true) {
            resolve({ session: true, data: response.result});
          } else {
            resolve(response.msg)
          }
        } else {
        }
      },(error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      });
    })
  }
/** get all seminars and their total present absent total student

*/

  getSeminarClassList(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'getSeminarClassList/' + data.school_id).then((response: any) => {
        if (response) {
          if (!response.response) {
            resolve({ session: false, message: response.msg });
          } else if (response.response) {
            resolve({ session: true, data: response.response });
          } else {
            reject(response.msg)
          }
        } else {
          reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** reorder all classes 

*/

  reorderClasses(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);

          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body= body.append("school_id", data.school_id);
          body= body.append("user_no", data.user_no);
          body= body.append("lang_code", data.lang_code);
          Object.keys(data.list).map((key) => {
            Object.keys(data.list[key]).map((sid) => {
              body= body.append('list[' + key + '][' + sid + ']', data.list[key][sid]);
            })
          })
          this.http.post(environment.serverURL + 'reorderClasses', body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (response.success == true) {
              resolve(true);
            } else {
              // this.errorALertMessage(response.msg);
              resolve(false);
            }
          }, (error) => {
            console.log(error);
            resolve(false);
          })
    })
  }

  /** submit email for forgot password
  */
  submitEmail(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'forgot_password').then((response: any) => {
        if (response) {
          if (!response.response) {
            resolve({ session: false, message: response.msg });
          } else if (response.response) {
            resolve({ session: true, data: response.response });
          } else {
            reject(response.msg)
          }
        } else {
          reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  /** Check OTP for sorgot password
  */
  checkOtp(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'checkOtp').then((response: any) => {
        if (response) {
          if (!response.response) {
            resolve({ session: false, message: response.msg });
          } else if (response.response) {
            resolve({ session: true, data: response.response });
          } else {
            reject(response.msg)
          }
        } else {
          reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  /** reset pass. for sorgot password
  */
  resetPassword(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'reset_password').then((response: any) => {
        if (response) {
          if (!response.response) {
            resolve({ session: false, message: response.msg });
          } else if (response.response) {
            resolve({ session: true, data: response.response });
          } else {
            reject(response.msg)
          }
        } else {
          reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** get all student of a school
  */
  getSchoolStudents(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'get_school_stu').then((response: any) => {
        if (response) {
          if (!response.response) {
            resolve({ session: false, message: response.msg });
          } else if (response.response) {
            resolve({ session: true, data: response.response });
          } else {
            reject(response.msg)
          }
        } else {
          reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

    /** get all student of a school
  */
  getSchoolUsers(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'get_school_users').then((response: any) => {
          if (response) {
            resolve({ session: true, data: response.response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
          reject(error.message)

      })
    })
  }

  getAllSchoolUsers(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.postRequest(data, 'get_school_users_all').then((response: any) => {
          if (response) {
            resolve({ session: true, data: response.response});
        } else {
            reject(response.msg)
        }
      }).catch((error) => {
        console.log(error);
          reject(error.message)

      })
    })
  }


  todayDashboard(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // console.log(data);
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          this.postRequest(data, 'todayDashboard/' + data.school_id).then((response: any) => {
            if (response) {
              if (!response.response) {
                resolve({ session: false, message: response.msg });
              } else if (response.response) {
                resolve({ session: true, data: response.response });
                this.studentService.setStaticalData(data.user_no,response.response);
              } else {
                reject(response.msg)
              }
            } else {
              reject(response.msg)
            }
          }).catch((error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        }else{
          this.studentService.getOfflineStatical(data.user_no,res=>{
            resolve({ session: true, data: res });
          })
        }
      })
      
    })
  }

   /** Register new course.
   * @param {Object} data - contains user_no, school_id, code, name, desc, semno
   * @returns Success or error msg
  */
 createNewCourse(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    this.postRequest(data, 'createCourse').then((response: any) => {
      if (response) {
        if (!response.session) {
          resolve({ session: false, message: response.msg });
        } else if (response.success) {
          resolve({ session: true, message: response.msg });
        } else {
          reject(response.msg)
        }
      }
    }).catch((error) => {
      console.log(error);
      if (error.message != undefined && error.message != '' && error.message != null) {
        reject(error.message)
      } else {
        reject(this.lang.usnexpectedError)
      }
    })
  })
}

/** Register new teacher.
   * @param {Object} data - contains user_no, school_id, Teacher Id, teacher name, teacher password
   * @returns Success or error msg
  */
 registerNewTeacher(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    this.postRequest(data, 'registerNewTeacher').then((response: any) => {
      if (response) {
        if(response.success) {
          resolve(response.msg);
        } else {
          reject(response.msg)
        }
      }
    }).catch((error) => {
      console.log(error);
      if (error.message != undefined && error.message != '' && error.message != null) {
        reject(error.message)
      } else {
        reject(this.lang.usnexpectedError)
      }
    })
  })
}
 registerNewParent(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    this.postRequest(data, 'registerNewParent').then((response: any) => {
      if (response) {
        if(response.success) {
          resolve(response.msg);
        } else {
          reject(response.msg)
        }
      }
    }).catch((error) => {
      console.log(error);
      if (error.message != undefined && error.message != '' && error.message != null) {
        reject(error.message)
      } else {
        reject(this.lang.usnexpectedError)
      }
    })
  })
}
  getAllRules(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getAllRules').then((response: any) => {
        if (response) {
          if(response.details) {
            resolve(response.details);
          } else {
            reject(response.msg)
          }
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
        //  reject(this.lang.usnexpectedError)
        }
      })
    })
  }

/** Register new Student.
   * @param {Object} data - contains user_no, school_id, name, student_id
   * @returns Success or Error msg
  */
 registerStudent(data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    this.postRequest(data, 'registerStudent').then((response: any) => {
      if (response) {
        if (!response.session) {
          resolve({ session: false, message: response.msg });
        } else if (response.success) {
          resolve({ session: true, message: response.msg });
        } else {
          reject(response.msg)
        }
      } else {
        this.dbProvider.getClasses().then((classes) => {
          resolve({ session: true, data: classes });
        }).catch((error) => {
          reject(error);
        })
      }
    }).catch((error) => {
      console.log(error);
      if (error.message != undefined && error.message != '' && error.message != null) {
        reject(error.message)
      } else {
        reject(this.lang.usnexpectedError)
      }
    })
  })
}

  /**
   * Update course description
   * @param data user_no, session_id, cid, course object
   */
  updateCourseDesc(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let headers = new HttpHeaders();
          headers.set('Content-Type', 'application/x-www-form-urlencoded');
          let body = new HttpParams();
          body= body.append("cid", data.cid);
          body= body.append("session_id", data.session_id);
          body= body.append("user_no", data.user_no);
          body= body.append("lang_code", data.lang_code);
          body=body.append('course[name]', data.course.name);
          body=body.append('course[desc]', data.course.desc);
          this.http.post(environment.serverURL + '/manageCourse', body, {headers}).subscribe((res) => {
            let response = res;
            if (!response['session']) {
              resolve({ session: false, message: response['msg'] });
            } else if (response['success']) {
              resolve({ session: true, data: response['courses'] });
            } else {
              reject(response['msg'])
            }
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /**
   * Get holiday list from backend
   * @param data user_no, school_id, session_id
   */
  getHolidays(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getHolidays/' + data.school_id).then((response: any) => {
        if (response) {
          if (response.success) {
            resolve(response);
          } else {
            reject(response.msg)
          }
        } else {
          resolve(false);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** Get student list according to course.
   * @param {Object} data - date, user_no, session_id, course_id, school_id
   * @returns list of students or error
  */
  getClassStudentList(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getStudents/' + data.course_id).then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            this.dbProvider.insertStudentList(response.students, 5);
            resolve({ session: true, data: response });
          } else {
            reject(response.msg)
          }
        } else {
          if (localStorage.getItem("classlocalatt")) {
            let attendance = JSON.parse(localStorage.getItem("classlocalatt"));
            if (attendance[data.course_id]) {
              resolve({ session: true, data: attendance[data.course_id] });
            } else {
              this.dbProvider.getStudentList(data.course_id).then((students) => {
                resolve({ session: true, data: { students: students, last_cem: 0, semteacher: [] } });
              }).catch((error) => {
                reject(error);
              })
            }
          } else {
            this.dbProvider.getStudentList(data.course_id).then((students) => {
              resolve({ session: true, data: { students: students, last_cem: 0, semteacher: [] } });
            }).catch((error) => {
              reject(error);
            })
          }
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }  
  /** Get student list according to course.
   * @param {Object} data - date, user_no, session_id, course_id, school_id
   * @returns list of students or error
  */
  getFollowUpStudentList(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getFollowUpStudentList/' + data.course_id).then((response: any) => {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, data: response });
          } else {
            reject(response.msg)
          }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

    /** Get student PDF.
   * @param {Object} data - date, user_no, session_id, course_id, school_id
   * @returns list of students or error
  */
  getMarksReport(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getMarksReport/' + data.course_id).then((response: any) => {
           if (response.response) {
            resolve({ session: true, data: response.response });
          } else {
            reject(response.msg)
          }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** Get delay student list according to course.
   * @param {Object} data - date, user_no, session_id, course_id, school_id
   * @returns list of students or error
  */
  getDelayClassStudentList(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getStudents_delay/' + data.course_id).then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            this.dbProvider.insertStudentList(response.students, response.delay_rule);
            resolve({ session: true, data: response });
          } else {
            reject(response.msg)
          }
        } else {
          if (localStorage.getItem("delayclasslocalatt")) {
            let attendance = JSON.parse(localStorage.getItem("delayclasslocalatt"));
            if (attendance[data.course_id]) {
              resolve({ session: true, data: attendance[data.course_id] });
            } else {
              this.dbProvider.getStudentList(data.course_id).then((students) => {
                if (students.length > 0) {
                  resolve({ session: true, data: { students: students, last_cem: 0, semteacher: [], delay_rule: students[0].delay_rule } });
                } else {
                  resolve({ session: true, data: { students: students, last_cem: 0, semteacher: [], delay_rule: 5 } });
                }
              }).catch((error) => {
                reject(error);
              })
            }
          } else {
            this.dbProvider.getStudentList(data.course_id).then((students) => {
              if (students.length > 0) {
                resolve({ session: true, data: { students: students, last_cem: 0, semteacher: [], delay_rule: students[0].delay_rule } });
              } else {
                resolve({ session: true, data: { students: students, last_cem: 0, semteacher: [], delay_rule: 5 } });
              }
            }).catch((error) => {
              reject(error);
            })
          }
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** Get student details.
   * @param {Object} data - user_no, session_id, cid, date, sid
   * @returns Student details or error
  */
  getStudentDetails(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          this.postRequest(data, 'viewStudent/' + data.sid).then((response: any) => {
            if (response) {
              if (!response.session) {
                reject(response.msg)
              } else if (response.success) {
                resolve({ session: true, data: response.details });
                let a=response.details
                let data=[];
                data.push(a);
              } else {
                reject(response.msg)
              }
            } else {
              reject(this.lang.networkNotWorking);

            }
          }).catch((error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        }

      })

    })
  }

  /** Get notes of the student.
   * @param {Object} data - user_no, session_id, cid, date, sid
   * @returns List of notes or error
  */
  getStudentNotes(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getStudentNote/' + data.sid).then((response: any) => {
        if (response) {
          if (response.status) {
            resolve(response);
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  createNotes(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
       let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
           let body = new HttpParams();
           data.lang_code = environment.lang_code;
           Object.keys(data).forEach(function (key) {
              body = body.append(key, data[key]);
          });
          body['studentIds']=[];
           Object.keys(data.studentIds).map((key) => {
            Object.keys(data.studentIds[key]).map((sid) => {
              body=body.append('studentId'+'['+ key+']'+'['+sid+']' , data.studentIds[key][sid]);
            })
          })

      this.httpClient.post( env.serverURL + 'createNotes',body, { headers: header }).subscribe((response: any) => {
        if (response) {
         console.log('tescherList',response);
          if (response.response==false) {
            resolve({ session: false, message: response.msg });
          } else if (response.response==true) {
            resolve({ session: true, data: response.msg});
          } else {
            resolve(response.msg)
          }
        } else {
        }
      },(error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      });
    })
  }

  getClassNotes(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'studentClassNotes').then((response: any) => {
        if (response) {
          if (response.response) {
            resolve(response.response);
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  getAllClassNotes(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'all_classNotes').then((response: any) => {
        if (response) {
          if (response.response) {
            resolve(response.response);
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }  
  getAllWarning(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getWarningReport').then((response: any) => {
        if (response) {
          if (response.response) {
            resolve(response.response);
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }  
  printWarning(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getWarningReportPdf').then((response: any) => {
        if (response) {
          if (response.response) {
            resolve(response.response);
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** Get notification of the school.
   * @param {Object} data- user_no, school_id, session_id
   * @returns list of notifications or error
   */
  getNotifications(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getNotifications/' + data.school_id).then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            this.dbProvider.insertPrivateMessages(response.list);
            resolve({ session: true, data: response.list });
          } else {
            reject(response.msg)
          }
        } else {
          this.dbProvider.getPrivateMessages().then((messages) => {
            resolve({ session: true, data: messages });
          })
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * delete user notification
   * @param data user_no, nid, session_id
   */
  deleteNotification(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'deleteNotifications').then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, message: response.msg });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Attendance mark post function
   * @param data user_no, session_id, cid, date, school_id, sheet
   */
  markAttendance(data: any): Promise<any> {
    // console.log(data);
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body= body.append("cid", data.cid);
          body= body.append("date", data.date);
          body= body.append("session_id", data.session_id);
          body= body.append("user_no", data.user_no);
          body= body.append("lang_code", data.lang_code);
          let index = 0;
          Object.keys(data.removal_sheet).map((key) => {
            body=body.append('removal_sheet[' + index + '][sid]', data.removal_sheet[key].sid);
            body=body.append('removal_sheet[' + index + '][sem]', data.removal_sheet[key].sem);
            index++;
          })
          Object.keys(data.sheet).map((key) => {
            Object.keys(data.sheet[key]).map((sid) => {
              body=body.append('sheet[' + key + '][' + sid + ']', data.sheet[key][sid]);
            })
          })

          this.http.post(environment.serverURL + 'saveAttendance/' + data.school_id, body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (!response.session) {
              resolve({ session: false, message: response.msg });
            } else if (response.success) {
              resolve({ session: true, message: response.msg });
            } else {
              reject(response.msg)
            }
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }
    /**
   * Attendance mark post function
   * @param data user_no, session_id, cid, date, school_id, sheet
   */
  submitMarks(data: any,marksheet): Promise<any> {
    // console.log(data);
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body= body.append("cid", data.course_id);
          body= body.append("date", data.date);
          body= body.append("session_id", data.session_id);
          body= body.append("user_no", data.user_no);
          body= body.append("lang_code", data.lang_code);

          Object.keys(marksheet).map((key) => {
            Object.keys(marksheet[key]).map((sid) => {
              body=body.append('marksheet[' + key + '][' + sid + ']', marksheet[key][sid]);
            })
          })

          this.http.post(environment.serverURL + 'saveStudentMarks/' + data.school_id, body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (!response.session) {
              resolve({ session: false, message: response.msg });
            } else if (response.success) {
              resolve({ session: true, message: response.msg });
            } else {
              reject(response.msg)
            }
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /**
  * Delay attendance mark post function
  * @param data user_no, session_id, cid, date, school_id, sheet
  * @param submittedByUser submitted by which user 1 - admin, 2- moderator
  */
  markDelayAttendance(data: any, submittedByUser: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {

          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body= body.append("cid", data.cid);
          body= body.append("date", data.date);
          body= body.append("session_id", data.session_id);
          body= body.append("user_no", data.user_no);
          body= body.append("lang_code", data.lang_code);
          Object.keys(data.sheet).map((key) => {
            Object.keys(data.sheet[key]).map((sid) => {
              body=body.append('sheet[' + key + '][' + sid + ']', data.sheet[key][sid]);
            })
          })
          this.http.post(environment.serverURL + 'ManroxTesting2/' + data.school_id + '/' + submittedByUser, body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (response.success == true) {
              resolve(true);
            } else {
              reject(response.msg)
            }
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /**
   * Absence save note
   * @param data sid, cid, date, note, user_no, session_id
   */
  saveAbsenceNote(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'saveNote').then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, message: response.msg, res: response });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Absence delete note
   * @param data user_no, session_id
   * @param note_id Note id which will be deleted
   */
  deleteAbsenceNote(data: any, note_id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'deleteNote/' + note_id).then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, message: response.msg });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Submit Student note
   * @param data sid, note, user_id
   */
  addStudentNote(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'addStudentNote').then((response: any) => {
        if (response) {
          if (response.success) {
            resolve(response.note_id);
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Update user image
   * @param data Base64 image data
   */
  updateUserImage(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'updateStudentImage/' + data.sid).then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, url: response.imageUrl });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * send Private message
   * @param data user_no, session_id, notification, isemail, school_id
   */
   addNews(data,school_id){
    let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          data.lang_code = environment.lang_code;
    let req = new HttpRequest('POST', env.serverURL + 'postNews', data, {
      responseType: 'arraybuffer',
      reportProgress: true
    });
    
    return this.http.request(req).pipe(
      map(event => this.getStatusMessage(event)),
      tap(message => message),
      last()
    );


  }   
  sendMessage(data,school_id){
    let header = new HttpHeaders();
          header.append('Content-Type', 'application/json');
          data.lang_code = environment.lang_code;
    let req = new HttpRequest('POST', env.serverURL + 'sendMessage/' + school_id, data, {
      responseType: 'arraybuffer',
      reportProgress: true
    });

    return this.http.request(req).pipe(
      map(event => this.getStatusMessage(event)),
      tap(message => message),
      last()
    );


  }
  // sendMessage(data: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     console.log(data);
  //     this.getNetworkInformation().then((isNetworkAvailable) => {
  //       if (isNetworkAvailable) {
  //         data.lang_code = environment.lang_code;
  //         let header = new HttpHeaders();
  //         header.append('Content-Type', 'application/x-www-form-urlencoded');
  //         let body: HttpParams = new HttpParams();
  //         body= body.append("user_no", data.user_no);
  //         body= body.append("session_id", data.session_id);
  //         body= body.append("isemail", data.isemail);
  //         body= body.append("lang_code", data.lang_code);
  //         Object.keys(data.notification).map((key) => {
  //           if (key == 'send_to') {
  //             Object.keys(data.notification[key]).map((send_to_key) => {
  //               body= body.append('notification[' + key + '][' + send_to_key + ']', data.notification[key][send_to_key]);
  //             })
  //           } else {
  //             body= body.append('notification[' + key + ']', data.notification[key]);
  //           }
  //         })
  //         this.http.post(environment.serverURL + 'sendMessage/' + data.school_id, body, { headers: header }).subscribe(() => {
  //           resolve(true);
  //         }, (error) => {
  //           console.log(error);
  //           if (error.message != undefined && error.message != '' && error.message != null) {
  //             reject(error.message)
  //           } else {
  //             reject(this.lang.usnexpectedError)
  //           }
  //         })
  //       } else {
  //         reject(this.lang.networkNotWorking);
  //       }
  //     })
  //   })
  // }
  postNews___OLD(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body= body.append("title", data.title);
          body= body.append("news_description", data.news_description);
          body= body.append("video", data.video);
          body= body.append("image", data.image);
          body= body.append("user_no", data.user_no);
          body= body.append("user_type", data.user_type);
          body= body.append("school_id", data.school_id);
          body= body.append("countryCode", data.countryCode);
          body= body.append("lang_code", data.lang_code);

          this.http.post(environment.serverURL + 'postNews', body, { headers: header }).subscribe(() => {
            resolve(true);
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }




  // postNews(data: any): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.getNetworkInformation().then((isNetworkAvailable) => {
  //       if (isNetworkAvailable) {
  //         data.lang_code = environment.lang_code;
  //         let header = new HttpHeaders();
  //         header.append('Content-Type', 'application/x-www-form-urlencoded');
  //         let body: any = new FormData();
  //         body.append("title", data.title);
  //         body.append("news_description", data.news_description);
  //         body.append("video", data.video);
  //         //body.append("image", data.image);
  //         body.append("user_no", data.user_no);
  //         body.append("user_type", data.user_type);
  //         body.append("school_id", data.school_id);
  //         body.append("countryCode", data.countryCode);
  //         body.append("lang_code", data.lang_code);

  //         this.http.post(environment.serverURL + 'postNews', body/*, { headers: header }*/).subscribe(() => {
  //           resolve(true);
  //         }, (error) => {
  //           console.log(error);
  //           if (error.message != undefined && error.message != '' && error.message != null) {
  //             reject(error.message)
  //           } else {
  //             reject(this.lang.usnexpectedError)
  //           }
  //         })
  //       } else {
  //         reject(this.lang.networkNotWorking);
  //       }
  //     })
  //   })
  // }

  /**
   * Update user settings
   * @param data user_no, session_id, user object
   */
  updateUserSettings(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = this.makeObjectToUrlParams(data);
          Object.keys(data.users).map((key) => {
            if (data.users[key] != '') {
                body= body.append('user[' + key + ']', data.users[key]);
            }
          })
          this.http.post(environment.serverURL + 'saveUser', body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (!response.session) {
              resolve({ session: false, message: response.msg });
            } else if (response.success) {
              resolve({ session: true, message: response.msg, pic: response.picUrl });
            } else {
              reject(response.msg)
            }
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /**
   * Get parent connect listing
   * @param data
   */
  getConnectChatList(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getParentConnectChatList').then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            this.dbProvider.insertParentConnectMessages(response.chat_list);
            resolve({ session: true, chatList: response.chat_list });
          } else {
            reject(response.msg)
          }
        } else {
          this.dbProvider.getParentConnectMessages().then((messages) => {
            resolve({ session: true, chatList: messages });
          }).catch((error) => {
            reject(error);
          })
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * create parent connect chat
   * @param data user_no, school_id, session_id, message object
   */
  createParentConnectChat(data: any): Promise<any> {
    console.log(data);
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body= body.append("user_no", data.user_no);
          body= body.append("session_id", data.session_id);
          body= body.append("school_id", data.school_id);
          body= body.append("lang_code", data.lang_code);
          if(data.chat_msg){
             Object.keys(data.chat_msg).forEach(function (key) {
                 body= body.append('chat_msg[' + key + ']', data.chat_msg[key]);
              });
          }
          Object.keys(data.message).map((key) => {
            if (data.message[key] != '') {
              body= body.append('message[' + key + ']', data.message[key]);
            }
          })
          this.http.post(environment.serverURL + 'createParentConnectChat', body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (!response.session) {
              resolve({ session: false,data:response, message: response.msg });
            } else if (response.success) {
              resolve({ session: true, url: response.msg });
            } else {
              reject(response.msg)
            }
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /**
   * Close parent connect chat
   * @param data user_no, chat_list_id, session_id
   */
  closeParentConnectChat(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'closeParentConnectChat').then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, message: response.msg });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Reopen parent connect chat
   * @param data user_no, chat_list_id, session_id
   */
  reopenParentConnectChat(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'reopenParentConnectChat').then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, message: response.msg });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Get parent connect chat messages
   * @param data user_no, school_id, user_type, session_id, chat_id
   */
  getParentConnectChatMessages(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getParentConnectChatMessages').then((response: any) => {
        if (response) {
          if (!response.session) {
            resolve({ session: false, message: response.msg });
          } else if (response.success) {
            resolve({ session: true, chat: response.chat });
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Send parent connect chat message
   * @param data session_id, user_type, chat_msg object
   */
  sendParentConnectChatMsg(data: any): Promise<any> {
    // console.log(data);
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body=body.append("session_id", data.session_id);
          body=body.append("user_no", data.user_no);
         body=body.append("user_type", data.user_type);
         body=body.append("lang_code", data.lang_code);
            Object.keys(data.chat_msg).forEach(function (key) {
               body= body.append('chat_msg[' + key + ']', data.chat_msg[key]);
            });
          // Object.keys(data.chat_msg).map((key) => {
          //   if (data.chat_msg[key] != '') {
          //     body= body.append('chat_msg[' + key + ']', data.chat_msg[key]);
          //   }
          // })
    // console.log('body',body);
          this.http.post(environment.serverURL + 'sendParentConnectChatMessage', body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (!response.session) {
              resolve({ session: false, message: response.msg });
            } else if (response.success) {
              if(response.attachment_url){
                resolve({ session: true, message: response.msg, msg_id: response.msg_id, attachment_url: response.attachment_url });
              }else{
                resolve({ session: true, message: response.msg, msg_id: response.msg_id });
              }
            } else {
              reject(response.msg)
            }
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject(this.lang.usnexpectedError)
            }
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /**
   * Send the contact form
   * @param data
   */
  sendContact(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'sendcontact').then((response: any) => {
        if (response) {
          if (response.success) {
            resolve(true);
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }
  /**
  * Absence delete note
  * @param data user_no, session_id
  * @param note_id Note id which will be deleted
  */
  deleteStudentNote(data: any, note_id: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'deleteStudentNote/' + note_id).then((response: any) => {
        if (response) {
          if (response.success) {
            resolve(true);
          } else {
            reject(response.msg)
          }
        } else {
          reject(this.lang.networkNotWorking);
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /**
   * Function to sync offline attendance
   */
  syncOffileData() {
    if (!this.syncInterval) {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          if (localStorage.getItem("attendance")) {
            let attendances = JSON.parse(localStorage.getItem("attendance"));
            let promises = [];
            attendances.forEach((attendance) => {
              promises.push(this.markOfflineAttendance(attendance));
            })
            Promise.all(promises).then((res) => {
              this.showToast('Attendance Synced successfully');
              localStorage.removeItem("attendance");
            })
          }

          if (localStorage.getItem("delayattendance")) {
            let delayAttendances = JSON.parse(localStorage.getItem("delayattendance"));
            let delayPromises = [];
            delayAttendances.forEach((delayAttendance) => {
              delayPromises.push(this.markOfflineDelayAttendance(delayAttendance.attendance, delayAttendance.submittedByUser));
            })
            Promise.all(delayPromises).then((res) => {
              this.showToast('Delay Attendance Synced successfully');
              localStorage.removeItem("delayattendance");
            })
          }
        }
      })
      this.syncInterval = setInterval(() => {
        this.getNetworkInformation().then((isNetworkAvailable) => {
          if (isNetworkAvailable) {
            if (localStorage.getItem("attendance")) {
              let attendances = JSON.parse(localStorage.getItem("attendance"));
              let promises = [];
              attendances.forEach((attendance) => {
                promises.push(this.markOfflineAttendance(attendance));
              })
              Promise.all(promises).then((res) => {
                // console.log(res);
                this.showToast('Attendance Synced successfully');
                localStorage.removeItem("attendance");
              })
            }
          }

          if (localStorage.getItem("delayattendance")) {
            let delayAttendances = JSON.parse(localStorage.getItem("delayattendance"));
            let delayPromises = [];
            delayAttendances.forEach((delayAttendance) => {
              delayPromises.push(this.markOfflineDelayAttendance(delayAttendance.attendance, delayAttendance.submittedByUser));
            })
            Promise.all(delayPromises).then((res) => {
              this.showToast('Delay Attendance Synced successfully');
              localStorage.removeItem("delayattendance");
            })
          }
        })
      }, 20000)
    }
  }

  /**
   * Offline Attendance mark post function
   * @param data user_no, session_id, cid, date, school_id, sheet
   */
  markOfflineAttendance(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body= body.append("cid", data.cid);
          body= body.append("date", data.date);
          body= body.append("session_id", data.session_id);
          body= body.append("user_no", data.user_no);
          body= body.append("lang_code", data.lang_code);
          let index = 0;
          Object.keys(data.removal_sheet).map((key) => {
            body=body.append('removal_sheet[' + index + '][sid]', data.removal_sheet[key].sid);
            body=body.append('removal_sheet[' + index + '][sem]', data.removal_sheet[key].sem);
            index++;
          })
          Object.keys(data.sheet).map((key) => {
            Object.keys(data.sheet[key]).map((sid) => {
             body= body.append('sheet[' + key + '][' + sid + ']', data.sheet[key][sid]);
            })
          })

          this.http.post(environment.serverURL + 'saveOfflineAttendance/' + data.school_id, body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (response.success) {
              resolve(true);
            } else {
              // this.errorALertMessage(response.msg);
              resolve(false);
            }
          }, (error) => {
            console.log(error);
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  /**
   * Offline Delay attendance mark post function
   * @param data user_no, session_id, cid, date, school_id, sheet
   * @param submittedByUser submitted by which user 1 - admin, 2- moderator
   */
  markOfflineDelayAttendance(data: any, submittedByUser: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          data.lang_code = environment.lang_code;
          let header = new HttpHeaders();
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          let body: HttpParams = new HttpParams();
          body= body.append("cid", data.cid);
          body= body.append("date", data.date);
          body= body.append("session_id", data.session_id);
          body= body.append("user_no", data.user_no);
          body= body.append("lang_code", data.lang_code);
          Object.keys(data.sheet).map((key) => {
            Object.keys(data.sheet[key]).map((sid) => {
              body= body.append('sheet[' + key + '][' + sid + ']', data.sheet[key][sid]);
            })
          })
          this.http.post(environment.serverURL + 'saveOfflineDelayAttendance/' + data.school_id + '/' + submittedByUser, body, { headers: header }).subscribe((res:any) => {
            let response = res;
            if (response.success == true) {
              resolve(true);
            } else {
              // this.errorALertMessage(response.msg);
              resolve(false);
            }
          }, (error) => {
            console.log(error);
            resolve(false);
          })
        } else {
          reject(this.lang.networkNotWorking);
        }
      })
    })
  }

  getChildrens(data): Promise<any> {
    return new Promise((resolve, reject) => {
      this.postRequest(data, 'getChildrens').then((response: any) => {
        if (response) {
          if (response.success) {
            resolve({data:response.child,permit:response.can_view_absent});
          } else {
            reject(response.msg)
          }
        }
      }).catch((error) => {
        console.log(error);
        if (error.message != undefined && error.message != '' && error.message != null) {
          reject(error.message)
        } else {
          reject(this.lang.usnexpectedError)
        }
      })
    })
  }

  /** Post request function.
   * @param {Object} data - contains the properties to post to API
   * @param {String} slug - contains the API method to call
   * @returns Success or error
   */
  postRequest(data: any, slug: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          data.lang_code = environment.lang_code;
          let body: HttpParams = this.makeObjectToUrlParams(data);
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          this.http.post(environment.serverURL + slug, body, { headers: header }).subscribe((response: any) => {
            if(response){
              if (response['_body'] != '') {
                let resObj = response;
                resolve(resObj)
              } else {
                reject("Unable to find any record");
              }
            }
          }, (error) => {
            reject(error);
          })
        } else {
          resolve(false);
        }
      })
    })
  }

  /** Function to convert object into param string
   * @param {Object} data - contains the properties to post to API
   * @returns Param string
  */

  makeObjectToUrlParams(data: any) {
    let body = new HttpParams();
	Object.keys(data).forEach(function (key) {
	     body = body.append(key, data[key]);
	});
    return body;
  }

  /**
   * get date in yyyy-mm-dd
   * @param date date object
   */
  getFormatedDate(date: Date) {
    let m = date.getMonth() + 1;
    return date.getFullYear() + '-' + m + '-' + date.getDate()
  }

  /**
   * Check whether network is available or not
   */
  getNetworkInformation(): Promise<any> {
    return new Promise((resolve) => {
      if (this.platform.is('cordova')) {
        if (this.network.type == this.network.Connection.UNKNOWN || this.network.type == this.network.Connection.NONE) {
          resolve(false);
        } else {
          resolve(true)
        }
      } else {
        resolve(true);
      }
    })
  }

  /**
   * Download image
   * @param url image url
   */
  downloadImage(url): Promise<any> {
    return new Promise((resolve, reject) => {
      let n = new Date().valueOf();
      const fileTransfer = this.transfer.create();
      if(this.platform.is('ios')){
        let targetPath = this.file.dataDirectory+ "Download/"  + n +".png"; //this.cordova.file.dataDirectory
        fileTransfer.download(encodeURI(url), targetPath, true).then((entry) => {
          resolve(true);
            console.log('download complete: ' + entry.toURL());
            // env.isDownloadPopupVisible = true;
        }, (error) => {
            // env.canDownloadFile = false;
            reject(this.lang.usnexpectedError);
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
        });
      }else{
        let targetPath = this.file.externalRootDirectory+ "Download/"  + n +".png"; //this.cordova.file.dataDirectory
        fileTransfer.download(url, targetPath, true).then((entry) => {
          resolve(true);
            console.log('download complete: ' + entry.toURL());
            // env.isDownloadPopupVisible = true;
        }, (error) => {
            // env.canDownloadFile = false;
            reject(this.lang.usnexpectedError);
            console.log("download error source " + error.source);
            console.log("download error target " + error.target);
            console.log("upload error code" + error.code);
        });
      }
    })
  }

  checkStoragePermission(): Promise<any>{
    return new Promise((resolve)=>{
      // this.photoLibrary.requestAuthorization({read:true,write:true}).then(()=>{
      //   resolve(true);
      // }).catch(()=>{
      //   resolve(false);
      // })
      this.diagnostic.requestExternalStorageAuthorization().then(()=>{
        //User gave permission 
        resolve(true);
        }).catch(error=>{
        resolve(false);
        //Handle error
        });
    })
  }
}
