import { Component, OnInit,NgZone,Input } from '@angular/core';
import { NavController,ModalController, MenuController, ToastController, AlertController,
         LoadingController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-create-class',
  templateUrl: './create-class.page.html',
  styleUrls: ['./create-class.page.scss'],
})
export class CreateClassPage implements OnInit {

  class:any = {};
  lang:any = {};
  /**
   * 
   * @param navCtrl Use for navigation between pages
   * @param translate used for translation service 
   * @param viewCtrl For view dismiss
   * @param dataProvider Use for getting data from the API
   */
  constructor(public navCtrl: NavController, public translate: TranslateService,
              public viewCtrl: ModalController, public dataProvider: DataService) {
                this.translate.get("alertmessages").subscribe((res)=>{
                  this.lang = res;
                })
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad CreateClassPage');
    if(localStorage.getItem("userloggedin")){
      let user = JSON.parse(localStorage.getItem("userloggedin"));
      this.class['school_id'] = user.details.school_id;
      this.class['user_no'] = user.details.user_no;
    }else{
      this.viewCtrl.dismiss(false);
    }
  }

  getSeminars(){
    return Array(8);
  }

  registerClass(){
    this.dataProvider.showLoading();
    this.dataProvider.createNewCourse(this.class).then((response)=>{
      this.dataProvider.hideLoading();
      if(response.session){
        this.dataProvider.showToast(response.message);
        this.viewCtrl.dismiss(true);
      }else{
        this.dataProvider.showToast(response.message);
      }
    }).catch((err)=>{
      this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(err);
    })
  }

  ngOnInit() {
  }

}
