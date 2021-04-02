import { Component,OnInit, ViewChild, ElementRef } from '@angular/core';
import { Platform, IonApp,AlertController } from '@ionic/angular';
import { DataService } from '../service/data/data.service';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../service/auth/auth.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { LocationService } from '../service/location/location.service';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { Router } from '@angular/router';
import {GeoServiceProvider} from '../service/geo-service/geo-service';
@Component({
  selector: 'app-news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {

   @ViewChild('videoPlayer') mVideoPlayer: ElementRef;

  allNews:any = [];
  originalNews:any = [];
  newsInterval:any;
  userDetails:any = {};
  noDataFound:string = '';
  lang:any = {};
  video: any;
  location_lang:any={};
  country_code:any;
  country:any;
  selected_country={
    code:"",
    name:"Worldwide"
  };
  /**
   *
   * @param app   Root app
   * @param dataProvider  Use for getting data from the API
   * @param authProvider  Use for authentication purpose
   * @param translate used for translation service
   * @param platform to check on which platform app is running
   * @param iap used to open the weblink within the app
   * @param socialSharing for sharing on social media
   */
  constructor(public dataProvider: DataService,
  			  public platform: Platform,
  			  public iap: InAppBrowser,
             // public app: IonApp,
             private geo:GeoServiceProvider,
              public authProvider: AuthService,
              public translate: TranslateService,
              public socialSharing: SocialSharing,
              private photoViewer: PhotoViewer,
              private router:Router,
              public alertController: AlertController,
              public locationSrevice:LocationService,
              public screen: ScreenOrientation) {
                this.translate.get("alertmessages").subscribe((res)=>{
                  this.lang = res;
                })
                this.translate.get("location").subscribe((res)=>{
                  this.location_lang = res;
                })
                this.dataProvider.language.subscribe((resq)=>{
                  this.translate.get("alertmessages").subscribe((res)=>{
                    this.lang = res;
                  })
                  this.translate.get("location").subscribe((res)=>{
                    this.location_lang = res;
                  })
                })
                this.country=this.geo.getAllCountries();
                console.log(this.country);
                this.authProvider.event.subscribe((res)=>{
                //  console.log('change',res)
                  if(res.changeUser){
                    this.ngOnInit(false);
                  }
                })

  }
  showPhoto(url){
    this.photoViewer.show(url);
  }
  addNews(){
    this.router.navigate(['post-news']);
  }

  ionViewWillEnter() {
 
  }
  ngOnInit(loading:boolean=true){
    let start = 0;
    let newsPerPage = 0;
    if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      console.log(this.userDetails);
    }
    this.geo.getMyLocation().then(resp=>{
      console.log(resp.countrycode);
      if(resp!=''){
        this.country_code=resp.countryCode;
      }else{
        this.dataProvider.showToast(this.location_lang.location_error);
      }
    })
    // this.locationSrevice.checkGPSPermission(resp=>{
      // this.country_code=resp.countryCode;
      // this.getNews(start, newsPerPage,resp.countryCode);
    // },e=>{
    //  this.dataProvider.showToast(this.location_lang.location_error);
    //   console.log(e);
    // });
   this.getNews(start, newsPerPage,'',loading);
  }

  ionViewWillLeave() {
    if (this.platform.is("cordova")) {
      this.screen.lock(this.screen.ORIENTATIONS.PORTRAIT).then(() => {
      }).catch((err) => {
        console.log(err);
      })
    }
  }
  portChange(event){
    console.log(event)
      let start = 0;
      let newsPerPage = 0;
    if(event.value.code){
      this.getNews(start, newsPerPage,event.value.code);
    }else{
      this.getNews(start, newsPerPage,null);
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
            this.getNews(start, newsPerPage,this.country_code);
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.location_lang.international,
          handler: () => {
            this.getNews(start, newsPerPage,null);
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

  urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url:string) {
        return '<a class="urlToOpen" data-url = "'+url+'">' + url + '</a>';
    })
  }
  /**
   * Function to get the news
   * @param start starting of news
   * @param newsPerPage news per page
   */
  getNews(start:number, newsPerPage:number,countryCode,loading:boolean=true):Promise<any>{
    return new Promise((resolve)=>{
     if(loading)this.dataProvider.showLoading();
      this.dataProvider.getNewsJoin(start, newsPerPage, this.userDetails.details,countryCode).then((totalNews)=>{
        this.dataProvider.hideLoading();
        this.allNews = [];
        if(totalNews.length > 0){
          this.originalNews = JSON.parse(JSON.stringify(totalNews));
          this.originalNews.forEach(news => {
            news.content = this.urlify(news.content);
            let date = news.ago.split(' ');
            if(date.length > 20){
              news.ago = date[2] + ' ' + date[1] + ' ' + date[0];
            }
          })
          if(this.originalNews.length > 1){
            this.allNews = this.originalNews.splice(0, 20);

          }else{
            this.allNews = this.originalNews;
          }

          for(let i = 0; i< this.allNews.length; i++){
            if(this.allNews[i].video_url != ''){
              if(this.platform.is("cordova")){
                this.screen.unlock();
              }
              break;
            }
          }
        }else{
          this.noDataFound = this.lang.no_news;
        }
        resolve(true);
      }).catch((err)=>{
        this.dataProvider.hideLoading();
        this.dataProvider.errorALertMessage(err);
        resolve(false);
      })
    })
  }

  doInfinite(infiniteScroll:any) {
    setTimeout(() => {
      this.allNews = this.allNews.concat(this.originalNews.splice(0, 20));
      infiniteScroll.target.complete();
    }, 500);
  }

  doRefresh(refresher){
    this.getNews(0, 0,'').then((res)=>{
      refresher.target.complete()
    })
  }

  /**
   * Open the url inside news content
   * @param event click event
   */
  openUrl(event:any){
    if(event.target.tagName == 'A' || event.target.tagName == 'a'){
      if(this.platform.is('cordova')){
        const browser = this.iap.create(event.target.textContent, '_blank');
        browser.show();
      }
    }
  }

  /**
   * Change the like or dislike status
   * @param news News object
   */
  changeLike(news:any){
    if(localStorage.getItem("userloggedin")){
      if(news.already_like == 'true' || news.already_like == true){
        this.dataProvider.dislikeNewsPost({
          session_id: this.userDetails.session_id,
          news_id: news.id,
          user_no: this.userDetails.details.user_no
        }).then((response)=>{
          if(response.session){
            // this.dataProvider.showToast(response.message);
            news.already_like = 'false';
            news.total_likes = parseInt(news.total_likes) - 1;
          }else{
            this.authProvider.flushLocalStorage();
            this.dataProvider.errorALertMessage(response.message);
           // this.app.getRootNav().setRoot("LoginPage");
          }
        })
      }else{
        this.dataProvider.likeNewsPost({
          session_id: this.userDetails.session_id,
          news_id: news.id,
          user_no: this.userDetails.details.user_no
        }).then((response)=>{
          if(response.session){
            // this.dataProvider.showToast(response.message);
            news.already_like = 'true';
            news.total_likes = parseInt(news.total_likes) + 1;
          }else{
            this.authProvider.flushLocalStorage();
            this.dataProvider.errorALertMessage(response.message);
          //  this.app.getRootNav().setRoot("LoginPage");
          }
        })
      }
    }else{
      this.dataProvider.showToast("Please login first");
    }
  }

  /**
   * Social sharing
   * @param news News object contains news content and image
   */
  share(news:any){
    let content = news.content +'\n\nتم نشر الخبر بواسطة تطبيق "نظام متابعة الطلاب"';
    if(this.platform.is('cordova')){
      if(news.news_image != ''){
        let imageUrl = news.news_image;
        this.socialSharing.share( content, news.title, imageUrl, null).then(res => {
          console.log(res);
        }, err => {
          console.log(err);
        })
      }else{
        this.socialSharing.share(content, news.title, null, null).then((res)=>{
        }).catch((err)=>{
          console.log(err);
        })
      }
    }
  }

  /**
   * Convert image url to image file for sharing
   * @param imageUrl Url of image
   */
  async getBase64ImageFromUrl(imageUrl) {
    var res = await fetch(imageUrl);
    var blob = await res.blob();

    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
  }


}
