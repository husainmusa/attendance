import { Injectable,NgZone } from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { NavController } from '@ionic/angular';
//import { RestapiProvider } from  '../providers/restapis/restapis';
//import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private zone: NgZone,public  navCtrl : NavController) {}
    async canActivate(  next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
      // todo: apply login status
      const isLoggedIn = JSON.parse(localStorage.getItem("userloggedin"));
      let isUser
      if(isLoggedIn){
        if(isLoggedIn.userType != 'guest'){
          isUser=true;
        }else{
          isUser=false;
        }

      }else{
        isUser=false;
      }
      console.log('isLoggedIn',isLoggedIn);
      if (!isLoggedIn) {
       // this.zone.run(() => { this.navCtrl.navigateRoot('/landing'); });
      }else{
      //	this.zone.run(() => { this.navCtrl.navigateRoot('/tabs'); });
      }
      //return await isLoggedIn.userType == 'guest'? false : true;
      return isUser;
    }
}
