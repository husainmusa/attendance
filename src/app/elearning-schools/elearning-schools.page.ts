import { Component, OnInit,NgZone, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController,IonContent, Platform,ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { LocationService } from '../service/location/location.service';
import {Location} from '@angular/common';
import {GeoServiceProvider} from '../service/geo-service/geo-service';

@Component({
  selector: 'app-elearning-schools',
  templateUrl: './elearning-schools.page.html',
  styleUrls: ['./elearning-schools.page.scss'],
})
export class ElearningSchoolsPage implements OnInit {


  /**
   * @member schools Array of schools who have the e learning materials
   * @member noDataFound used for diplaying the message when no child found
   * @member lang Contains the language translation object
   */
  schools:any = [];
  noDataFound:string = '';
  lang:any = {};
  country_code:any;
  location_lang:any;
  country:any;
  selected_country={
    code:"",
    name:"Worldwide"
  };

  /**
   *
   * @param navCtrl Use for navigation between pages
   * @param translate used for translation service
   * @param dataProvider Use for getting data from the API
   */
  constructor(public navCtrl: NavController,
  	public translate: TranslateService,
  	public dataProvider: DataService,
    private router:Router,
    public alertController: AlertController,
  	private route : ActivatedRoute,
    public locationSrevice:LocationService,
             private geo:GeoServiceProvider,
    public zone:NgZone, ) {
    this.translate.get("alertmessages").subscribe((res)=>{
      this.lang = res;
    })
    this.translate.get("location").subscribe((res)=>{
      this.location_lang = res;
    })

  }

  /**
   * Ionic navigation event will run when page is loaded
   */
  ionViewWillEnter() {
    this.geo.getMyLocation().then(resp=>{
      console.log(resp.countrycode);
      if(resp!=''){
        this.country_code=resp.countryCode;
      }else{
        this.dataProvider.showToast(this.location_lang.location_error);
      }
    })
    // this.locationSrevice.checkGPSPermission(resp=>{
    //   this.country_code=resp.countryCode;
    //   // this.getSchool(this.country_code);
    // },e=>{
    // this.dataProvider.showToast(this.location_lang.location_error);
    //   console.log(e);
    // });
    this.country=this.geo.getAllCountries();
       this.getSchool(null);

  }

  portChange(event){
    console.log(event)
      let start = 0;
      let newsPerPage = 0;
    if(event.value.code){
      this.getSchool(event.value.code);
      // this.getNews(start, newsPerPage,);
    }else{
      this.getSchool(null);
    }
  }
  getSchool(location){
    this.dataProvider.getSchool(location).then((schoolList) => {
      this.schools = schoolList;
      if(this.schools && this.schools.length==0){
        this.noDataFound = this.lang.no_schools_found;
      }
    }).catch((err)=>{
      console.log(err);
    })
  }

    async selectNewsCountry(){
    let start = 0;
    let newsPerPage = 0;
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: this.location_lang.select_country,
      message: this.location_lang.select_country_subheading,
      mode:'ios',
      buttons: [
        {
          text: this.location_lang.local,
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.getSchool(this.country_code);
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.location_lang.international,
          handler: () => {
            this.getSchool(null);
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Open the school page where all material will be shown
   * @param school Selected School information object
   */
  openschool(school:any) {
    const navigation: NavigationExtras = {

      state : {schoolInfo: school,country_code:this.country_code}
      };
      //console.log(navigation);
      this.zone.run(() => {
        this.router.navigate(['elearning-school-video'], navigation);
      });
   // this.navCtrl.push("ElearningSchoolVideosPage", {schoolInfo: school});
  }

  ngOnInit() {
  }

}
