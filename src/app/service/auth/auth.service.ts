import { Injectable, EventEmitter } from '@angular/core';
import { environment } from '../../../environments/environment';
//import { LoginModel } from '../../model/login.model';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams} from '@angular/common/http';
//import { Events } from 'ionic-angular';
import { Network } from '@ionic-native/network/ngx';
import {Platform,LoadingController ,AlertController ,ModalController ,NavController } from '@ionic/angular';
import { DatabaseService } from '../database/database.service';
import { Storage } from '@ionic/storage';
import { PopoverController } from '@ionic/angular';
import {LoaderComponent} from '../../components/loader/loader.component';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
public event: EventEmitter<any>;
public eventChangeUser: EventEmitter<any>;
  /**
    * Represents a Auth provider from API.
    * @constructor
    * @param {Http} http - for making http request.
    * @param {Events} events - events for the app  
  */
  constructor(public http: HttpClient, public network: Network, public platform: Platform,
    public dbProvider: DatabaseService,public popoverController: PopoverController,
    private router:Router,private storage: Storage) {
  	this.event = new EventEmitter(); 
    this.eventChangeUser = new EventEmitter(); 
  }

  /**
   * Login function from the API
   * @param user: Object of LoginModel
   */
  changeUser(peram){
    let em={"changeUser": peram}
        this.event.emit(em);
  }
   publishEvent(peram){
   	let em={"loggedin": peram}
        this.event.emit(em);
   }
   piblisEvenetActiveLink(param){
   	let em={"activeLink": param} 
        this.event.emit(em);
   }
   deleteNote(param){
     let em={"deleteNote": param} 
        this.event.emit(em);
   }
  doLogin(user): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          user['lang_code'] = environment.lang_code;
          let body: HttpParams = this.makeObjectToUrlParams(user);
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          this.http.post(environment.serverURL + 'login', body, { headers: header }).subscribe((response:any) => {
            let resObj = response;
            if (resObj.success) {
              localStorage.setItem("userloggedin", JSON.stringify(resObj));
              resolve(resObj);
            } else {
              reject(resObj.msg);
            }
          }, (error) => {
            console.log(error);
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject("حدث خطأ غير متوقع يرجى معاودة المحاولة في وقت لاحق.")
            }
          })
        } else {
          reject("الرجاء التأكد من اتصالك بالانترنت");
        }
      })
    })
  }

  /**
   * Register School
   * @param school: school object to register  
   */
  registerSchool(school: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let headers = new HttpHeaders();
          //school['lang_code'] = environment.lang_code;
          let body: HttpParams = this.makeObjectToUrlParams(school);
          headers.append('Content-Type', 'application/x-www-form-urlencoded');
          this.http.post(environment.serverURL + 'schoolRegister', body, { headers }).subscribe((response:any) => {
            let resObj = response;
            if (resObj.success == true) {
              resolve(resObj.msg);
            } else {
              reject(resObj.msg);
            }
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject("حدث خطأ غير متوقع يرجى معاودة المحاولة في وقت لاحق.")
            }
          })
        } else {
          reject("الرجاء التأكد من اتصالك بالانترنت");
        }
      })
    })
  }


  /**
   * Logout function
   * @param data - user_no, session_id
   */
  doLogout(data: any,option?:any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.getNetworkInformation().then((isNetworkAvailable) => {
        if (isNetworkAvailable) {
          let header = new HttpHeaders();
          let body: HttpParams = this.makeObjectToUrlParams(data);
          header.append('Content-Type', 'application/x-www-form-urlencoded');
          this.http.post(environment.serverURL + 'logout', body, { headers: header }).subscribe((response:any) => {
            if (response.success) {
              this.flushLocalStorage();
              let em={"loggedin": false}
              this.event.emit(em);
              this.publishEvent(false);
              if(!option){
                let oldUser = JSON.parse(localStorage.getItem("earlyLogin"));
                if(oldUser){
                  if(oldUser.length>1){
                    reject(false);
                    this.logInOtherAccount(data);
                  }else{
                    localStorage.removeItem("earlyLogin");
                    resolve(true);
                  }
                }else{
                    localStorage.removeItem("earlyLogin");
                    resolve(true);
                }
              }else{
                    resolve(true);
              }
            } else {
              reject(response.json().msg);
            }
          }, (error) => {
            if (error.message != undefined && error.message != '' && error.message != null) {
              reject(error.message)
            } else {
              reject("حدث خطأ غير متوقع يرجى معاودة المحاولة في وقت لاحق.")
            }
          })
        } else {
          reject("الرجاء التأكد من اتصالك بالانترنت");
        }
      })
    })
  }

  logInOtherAccount(data){
    let ind:any;
    let loggedinUser:any;
    if(localStorage.getItem('earlyLogin')){
      loggedinUser=JSON.parse(localStorage.getItem("earlyLogin"));
      setTimeout(res=>{
        console.log('here1',loggedinUser);
        for (let i = 0; i < loggedinUser.length; i++) {
          if(loggedinUser[i].user_no==data.user_no){
            ind=i;
            console.log('here',i);
          }
        }
        loggedinUser.splice(ind,1);
        localStorage.setItem("earlyLogin",JSON.stringify(loggedinUser));
        console.log('here2',loggedinUser);
        if(loggedinUser){
          if(loggedinUser.length>0){
            this.logInOldUser(loggedinUser[0]);
          }else{
            this.router.navigate(['login']);
          }
        }else{
          this.router.navigate(['login']);
        }
      },400)
    }
  }
  logInOldUser(users) {
      console.log('next',users);
      this.presentPopover('');
    this.doLogin(users).then((response)=>{
      console.log('res',response);
      this.publishEvent(true);
      this.changeUser(true);
      if(response.details.user_type == '4'){
        this.router.navigate(['tabs/children'], { replaceUrl: true });
      }else if(response.details.user_type == '8'){
        this.router.navigate(['tabs/student-notes'], { replaceUrl: true });
      }else{
        this.router.navigate(['tabs'], { replaceUrl: true });

      }
    }).catch((error)=>{
    })
  }

  async presentPopover(ev:any) {
     const popOver = await this.popoverController.create({
      component: LoaderComponent,
      backdropDismiss:true,
      //event: ev,
      translucent: false,
     // animated:true,
      cssClass:'loaderStyle',
     // mode:"ios"
    });
    await popOver.present();
    setTimeout(res=>{
          popOver.dismiss();
    },2000)
  }

  /** Function to convert object into param string
    * @param {Object} data - contains the properties to post to API
    * @returns Param string
  */
  makeObjectToUrlParams(data) {
  	let body = new HttpParams();
	Object.keys(data).forEach(function (key) {
	     body = body.append(key, data[key]);
	});
    //let body: HttpParams = new HttpParams();
    // Object.keys(data).map((key) => {
    // 	console.log(key);
    //   body.set(key, data[key]);
    // })
    console.log(body);
    return body;
  }

  /**
   * Clear the localstorage
   */
  flushLocalStorage() {
    localStorage.removeItem("userloggedin");
    this.dbProvider.deleteDataBase();
    localStorage.removeItem("attendance")
    this.storage.clear();
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

}
