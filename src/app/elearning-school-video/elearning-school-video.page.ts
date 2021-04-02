import { Component, OnInit,NgZone, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController,IonContent, Platform,ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {Location} from '@angular/common'; 
import {GeoServiceProvider} from '../service/geo-service/geo-service';
@Component({
  selector: 'app-elearning-school-video',
  templateUrl: './elearning-school-video.page.html',
  styleUrls: ['./elearning-school-video.page.scss'],
})
export class ElearningSchoolVideoPage implements OnInit {

  /**
   * @member categories array of categories
   * @member school conatins the information about the school
   */
  categories:any = [];
  school:any = {};
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
   * @param navParams Use for navigation parameters passed from previous page
   * @param dataProvider Use for getting data from the API
   */
  constructor(public navCtrl: NavController, 
  //	public navParams: NavParams, 
  	          public dataProvider: DataService,
              private route : ActivatedRoute,
              private alertController:AlertController,
              public translate: TranslateService, 
             private geo:GeoServiceProvider,
              private router:Router,
              public zone:NgZone) {

    this.translate.get("location").subscribe((res)=>{
      this.location_lang = res;
    })
  	this.route.queryParams.subscribe(params => {
	      if (this.router.getCurrentNavigation().extras.state) {
	      		 
             this.dataProvider.showLoading();
		    //this.school = this.navParams.get("schoolInfo");
		    this.school = this.router.getCurrentNavigation().extras.state.schoolInfo;
        this.country_code = this.router.getCurrentNavigation().extras.state.country_code;
        this.getElerningMaterials(null);
        this.country=this.geo.getAllCountries();
             console.log(this.school);
	      }
	    });
  }
  getElerningMaterials(c_dode){
    console.log(this.school.id);
    this.dataProvider.getElearningMaterials(this.school.id,c_dode).then((materialList) => {
      this.dataProvider.hideLoading();
      this.categories = materialList;
    }).catch((err)=>{
      this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(err);
    })
  }
  hideDisplay(i,b){
    console.log(i);
    var x = document.getElementById(i);
    console.log(x.style.display);
    if(x.style.display === ""){
      x.style.display = "block";
    }else if(x.style.display === "none") {
        x.style.display = "block";
    }else {
        x.style.display = "none";
      }
  }
  /**
   * Ionic navigation event will run when page is loaded
   */
  ionViewWillEnter() {
    
  }
  playCategoryList(){
    
  }
    portChange(event){
    console.log(event)
      let start = 0;
      let newsPerPage = 0;
    if(event.value.code){
      this.getElerningMaterials(event.value.code);
      // this.getNews(start, newsPerPage,);
    }else{
      this.getElerningMaterials(null);
    }
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
            this.getElerningMaterials(this.country_code);
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.location_lang.international,
          handler: () => {
            this.getElerningMaterials(null);
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Open the video play page and pass the material id
   * @param materialId id of the material selected
   */
  playvideo(materialId:any) {
     const navigation: NavigationExtras = {

      state : {materialId: materialId}
      };
      //console.log(navigation);
      this.zone.run(() => {
        this.router.navigate(['playvideo'], navigation);
      });
    //this.navCtrl.push("PlayvideoPage",{materialId: materialId})
  }

  ngOnInit() {
  }

}
