import { Component, OnInit , NgZone } from '@angular/core';
import { Platform,MenuController,NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';
//import { tabs } from '../pages/tabs/tabs';
import { AuthService } from './service/auth/auth.service';
import { DataService } from './service/data/data.service';
import { DatabaseService } from './service/database/database.service';
import { Network } from '@ionic-native/network/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';
import { FCM } from '@ionic-native/fcm/ngx';
import { ToastController } from '@ionic/angular';


declare var cordova :any;
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {

  rootPage: any;
  loggedin: boolean = false;
  activePage: any;
  user:any={};
  lang:any = {};
  activeLink:any = {};
  pages: Array<{ title: string, component: any, icon: any }>;
  changedLanguage='English';
  checked=false;
  runNetwork=false;
  isSchoolAdmin:any;
  routeDone=false;

  /**
   * Constructor
   * @param platform platform object
   * @param statusBar statusbar object to of StatusBar plugin
   * @param splashScreen used for splash screen hide
   * @param translate translation service
   * @param events used for app custom events
   * @param auth Authentication provider object
   * @param screen Object of ScreenOrientation for screen orientation
   * @param dataProvider Dataprovider provider object
   * @param dbProvider Local database  provider object
   * @param network Network object of plugin NetworkInformation
   */
  constructor(public platform: Platform,
              public statusBar: StatusBar,
              public splashScreen: SplashScreen,
              public translate: TranslateService,
              public auth: AuthService,
              public screen: ScreenOrientation,
              public dataProvider: DataService,
              public dbProvider: DatabaseService,
              public network: Network,
              public zone:NgZone,
              private route : ActivatedRoute,
              private storage: Storage,
              private deeplinks:Deeplinks,
              private navController:NavController,
              public socialSharing: SocialSharing,
              public iap: InAppBrowser,
              private fcm: FCM,
              public menuCtrl: MenuController,
              public toastController: ToastController,
              public router:Router) {
    this.storage.get('language').then(res=>{
        // console.log('res',res);
        if(res){
          if(res=='en'){
            this.checked=false;
          }else{
            this.checked=true;
          }
          this.translate.setDefaultLang(res);
          this.dataProvider.language.emit(res);
        }else{
          this.checked=true;
          this.translate.setDefaultLang('ar');
          this.dataProvider.language.emit('ar');
        }
          this.initializeApp();
      })
    this.auth.event.subscribe((status) => {
      if(status.loggedin){

        this.loggedin = status.loggedin;
        this.setUserdetails();
        if (status.loggedin) {

          this.pages = [];
          if (this.user.userType == 'parent') {
          } else if(this.user.userType !='student') {
           this.pages.push({ title: this.lang.sidemenu.class_list, component: "tabs", icon: "list" });
          }else  if(this.user.userType =='moderator'){
              this.pages.push({ title: this.lang.sidemenu.student_report, component: "student-report-classes", icon: "bar-chart" });
              this.pages.push({ title: this.lang.sidemenu.billetins, component: "bulletins", icon: "list" });
          }
          if(this.user.userType =='moderator'){
                this.pages.push({ title: this.lang.sidemenu.student_report, component: "student-report-classes", icon: "bar-chart" });
          }
          if (this.user.userType == 'admin') {
            this.pages.push({ title: this.lang.sidemenu.student_report, component: "student-report-classes", icon: "bar-chart" });
            this.pages.push({ title: this.lang.sidemenu.manage_teacher, component: "manage-teacher", icon: "list" });
            this.pages.push({ title: this.lang.sidemenu.manage_student, component: "manage-student", icon: "list" });
            this.pages.push({ title: this.lang.sidemenu.new_parent, component: "requested-parent", icon: "list" });
            this.pages.push({ title: this.lang.sidemenu.billetins, component: "bulletins", icon: "list" });
            this.pages.push({ title: this.lang.sidemenu.parent_connect, component: "parentconnect", icon: "list" });
          }if (this.user.userType == 'student') {
          }

          if (this.user.userType == 'teacher' || this.user.userType == 'moderator') {
           this.pages.push({ title: this.lang.sidemenu.billetins, component: "bulletins", icon: "list" });
          }

          this.pages.push({ title: this.lang.sidemenu.e_learning, component: "elearning-schools", icon: "list" },
            // { title: this.lang.sidemenu.settings, component: "settings", icon: "settings" }
            );
        } else {
          this.pages = [
            { title: this.lang.sidemenu.login, component: "login", icon: "log-in" },
            { title: this.lang.sidemenu.news, component: "news", icon: "time" },
            { title: this.lang.sidemenu.e_learning, component: "elearning-schools", icon: "list" }
          ];
        }
      }
      if(status.loggedin==false){
        this.user={};
        this.loggedin = status.loggedin;
        this.pages = [
            { title: this.lang.sidemenu.login, component: "login", icon: "log-in" },
            { title: this.lang.sidemenu.news, component: "news", icon: "time" },
            { title: this.lang.sidemenu.e_learning, component: "elearning-schools", icon: "list" }
          ];
      }
    })
  }

  /**
   * Initializer function will run when app is ready
   */
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.backgroundColorByHexString("#FFFFFF");
      this.statusBar.overlaysWebView(false);
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      if(this.platform.is('cordova')){
     	(<any>window).open = (<any>cordova).InAppBrowser.open;
      }


      this.translate.get(["sidemenu", "alertmessages","app_rate","switch_account"]).subscribe((response)=>{
        this.lang = response;
        this.dbProvider.openDataBase().then(() => {
          if (localStorage.getItem("userloggedin")) {
            this.loggedin = true;
            this.setUserdetails();
            this.pages = [];

            if (this.user.userType == 'parent') {
            } else  if(this.user.userType !='student'){
              this.pages.push({ title: this.lang.sidemenu.class_list, component: "tabs", icon: "list" });
            }else  if(this.user.userType =='moderator'){

              this.pages.push({ title: this.lang.sidemenu.student_report, component: "student-report-classes", icon: "bar-chart" });
              this.pages.push({ title: this.lang.sidemenu.billetins, component: "bulletins", icon: "list" });
            }
            if(this.user.userType =='moderator'){
                this.pages.push({ title: this.lang.sidemenu.student_report, component: "student-report-classes", icon: "bar-chart" });
            }

            if (this.user.userType == 'admin') {
              this.pages.push({ title: this.lang.sidemenu.student_report, component: "student-report-classes", icon: "bar-chart" });
              this.pages.push({ title: this.lang.sidemenu.manage_teacher, component: "manage-teacher", icon: "list" });
              this.pages.push({ title: this.lang.sidemenu.manage_student, component: "manage-student", icon: "list" });
              this.pages.push({ title: this.lang.sidemenu.new_parent, component: "requested-parent", icon: "list" });
              this.pages.push({ title: this.lang.sidemenu.billetins, component: "bulletins", icon: "list" });
              this.pages.push({ title: this.lang.sidemenu.parent_connect, component: "parentconnect", icon: "list" });
          }if (this.user.userType == 'student') {
          }
           if (this.user.userType == 'teacher' || this.user.userType == 'moderator') {
             this.pages.push({ title: this.lang.sidemenu.billetins, component: "bulletins", icon: "list" });
           }
            this.pages.push({ title: this.lang.sidemenu.e_learning, component: "elearning-schools", icon: "list" },
            // { title: this.lang.sidemenu.settings, component: "settings", icon: "settings" }
            );
            if (this.user.userType == 'parent') {
              this.rootPage = "ChildrenPage";
            } else {
              this.rootPage = 'tabs';
            }
          } else {
            this.checkRoute();
            this.pages = [
              { title: this.lang.sidemenu.login, component: "login", icon: "log-in" },
              { title: this.lang.sidemenu.news, component: "news", icon: "list" },
              { title: this.lang.sidemenu.e_learning, component: "elearning-schools", icon: "list" }
            ];
            this.rootPage = "login";
          }
          this.deeplinks.routeWithNavController(this.navController, {
            '/registerteacher': 'register-teacher',
            '/parent_register':'parent-register'
            }).subscribe((match) => {
            console.log('Successfully matched route', match);
              let link=match.$link.path;
              let query=match.$link.queryString;
              let que = query.split("&");
              let id= que[0].split("=");
              let un= que[1].split("=");
              let res = link.split("/");
              let es = res[2].split(".");
              let s=es[0];
              console.log('app',s,id,un);
              const navigation: NavigationExtras = {
                state : {
                    id: id[1],
                    un:un[1]
                }
              };
              if(s=='parent_register'){
                  this.zone.run(() => {
                    this.router.navigate(['parent-register'], navigation);
                  });
              }else{
                  this.zone.run(() => {
                    this.router.navigate(['register-teacher'], navigation);
                  });
              }
              this.routeDone=true;
            }, (nomatch) => {
            // console.error('Got a deeplink that didn\'t match', nomatch);
            });
        })

        if (this.platform.is('cordova')) {
          this.screen.lock(this.screen.ORIENTATIONS.PORTRAIT).then(()=>{
          }).catch((err)=>{
            console.log(err);
          })
          setTimeout(()=>{
            if(this.network.type == this.network.Connection.UNKNOWN || this.network.type == this.network.Connection.NONE){
              // this.dataProvider.showToast(this.lang.alertmessages.offline);
              // console.log('notOnline:::::::::::::::::::',this.network.type);
            }
          }, 1000)
          this.network.onDisconnect().subscribe(() => {
            // console.log('notOnline:::::::::::::::::::',this.network.type);
            this.dataProvider.showToast(this.lang.alertmessages.not_online);
          })
          this.network.onConnect().subscribe(() => {
             // console.log('online:::::::::::::::::::',this.network.type);
             if(!this.runNetwork){
               this.runNetwork=true;
            //  this.dataProvider.showToast(this.lang.alertmessages.online);
             }
          })
        }
      })
      this.auth.event.subscribe((data)=>{
        if(data){
          if(data.activeLink){
            // console.log('activeLink',data.activeLink);
            this.activeLink = data.activeLink;
          }
        }
      })
      if(this.platform.is('ios')){
          const w: any = window;
          w.FCMPlugin.requestPushPermissionIOS(() => {
            console.log('push permissions recieved');
          }, (e) => {
            console.log('push permissions failed', e);
          });
      }

      this.fcm.onNotification().subscribe(data => {
        if(data.wasTapped){
          console.log("Received in background",data);
        } else {
          console.log("Received in foreground",data);
          if(this.platform.is('ios')){
            this.presentToast(data.aps.alert.body);
          }else{
            this.presentToast(data.body);
          }
        };
      });
    });
  }


  /** present toast for notification
      @param: message -- message of notification
   **/

    async presentToast(message) {
      const toast = await this.toastController.create({
        message: message,
        duration: 3000,
        position: "top",
        mode:'ios',
        color:'danger'
      });
      toast.present();
    }


  /**
   * Function to open the page
   * @param page Page object of pages array
   */
  openPage(page: any) {
    if(page.component){
      if (page.component == "login") {
       this.router.navigate([page.component]);
      } else {
        this.router.navigate([page.component]);
      }
    }else{
      this.router.navigate([page])
    }
    this.activePage = page;
    this.menuCtrl.close();
  }

  /**
   * Used to get the active page
   * @param page Page object of pages array
   */
  getActivePage(page: any) {
    return this.activePage == page;
  }
  checkRoute(){
    if(!this.routeDone){
       if (this.user.userType == 'parent') {
         this.router.navigate(['tabs/children'],{replaceUrl:true});
        } else if(!this.user.userType) {
           this.router.navigate(['login'],{replaceUrl:true});
        }else if(this.user.userType == 'student') {
           this.router.navigate(['tabs/student-notes'],{replaceUrl:true});
        }else{
          this.router.navigate(['tabs'],{replaceUrl:true});
        }
    }
  }

  /**
   * Logout function
   */
  logout() {
    let userDetail = JSON.parse(localStorage.getItem("userloggedin"));
    let data = {
      "user_no": userDetail.details.user_no,
      "session_id": userDetail.session_id
    }
    this.dataProvider.showLoading();
    this.auth.doLogout(data).then((resp) => {
      this.dataProvider.hideLoading();
    this.router.navigate(['login'],{replaceUrl:true})
    }).catch((error) => {
      this.dataProvider.hideLoading();
    })
     this.menuCtrl.close();
  }

  /**
   * Function to use set user details
   */
  setUserdetails() {
  //  console.log('details',localStorage.getItem("userloggedin"));
    if (localStorage.getItem("userloggedin")) {
      let userDetail = JSON.parse(localStorage.getItem("userloggedin"));
      this.isSchoolAdmin=userDetail.details.is_school_admin;
      // console.log('isSchoolAdmin',this.isSchoolAdmin);
      // console.log(userDetail.details);
      if(userDetail.details.is_school_admin==1){
        this.user.name = userDetail.details.school_name;
          this.user.image =  userDetail.details.school_logo ? userDetail.details.school_logo : "./assets/imgs/logo.png";
      }else{
        this.user.name = userDetail.details.first_name + " " + userDetail.details.last_name;
        this.user.image =   userDetail.details.pic ? userDetail.details.pic : "./assets/imgs/logo.png";
      }
      // this.user.image = userDetail.details.pic ? userDetail.details.pic : "./assets/imgs/logo.png";
      this.user.description = userDetail.details.school_name;
      this.user.school_image=userDetail.details.school_logo;
      this.user.is_school_admin=userDetail.details.is_school_admin;
      if (userDetail.details.user_type == '1') {
        if(userDetail.details.school_details != ''){
          if(userDetail.details.is_school_admin!=1){
            this.user.description = '';
          }else{
            this.user.description = userDetail.details.school_details;
          }
        }
        this.user.userType = 'admin';
      } else if (userDetail.details.user_type == '2') {
        this.user.userType = 'teacher';
      } else if (userDetail.details.user_type == '3') {
        this.user.userType = 'moderator';
      } else if (userDetail.details.user_type == '4') {
        this.user.userType = 'parent';
      }else if(userDetail.details.user_type == '7') {
        this.user.userType = 'viewer';
      }else if(userDetail.details.user_type == '8') {
        this.user.userType = 'student';
      }
    } else {
      // this.user.name = "Guest";
      // this.user.image = "./assets/imgs/logo.png";
      // this.user.userType = 'guest';
    }
    this.checkRoute();
  }

  /**
   * Share teacher registration link
   */
  shareRegistrationLink(){
    this.socialSharing.share( "Teacher Registration", "This is registration link for the new teacher.", null, this.activeLink.link).then(res => {
      console.log(res);
    }, err => {
      console.log(err);
    })
  }

  shareParentRegistrationLink(){
    this.socialSharing.share( "Parent Registration", "This is registration link for the new parents.", null, this.activeLink.parent_link_active).then(res => {
      console.log(res);
    }, err => {
      console.log(err);
    })
  }
  registerParent(page){
    if(page=='parent_register'){

    this.router.navigate(['parent-register']);
  }else{
    this.router.navigate(['requested-parent']);
  }
    this.menuCtrl.close();
  }

  shareApp(){
    this.dataProvider.showLoading()
    this.dataProvider.getShareLink('elem').then(response=>{
      this.dataProvider.hideLoading();
      console.log(response.short_url);
        this.socialSharing.share( null, null, null,response.short_url).then(res => {
          console.log(res);
        }, err => {
          console.log(err);
        })
        this.menuCtrl.close();
    }).catch(e=>{
      this.dataProvider.hideLoading();
      console.log(e);
    })
  }
  rateApp(){
    let lang= this.translate.getDefaultLang();
    //console.log(lang);
    // this.dataProvider.presentRatingPopover(this.lang.app_rate);
    this.dataProvider.showRatePrompt(lang);
    this.menuCtrl.close();
  }
  /**
   * Open backend url
   */
  openBackendUrl(){
    if(this.platform.is('cordova')){
      const browser = this.iap.create("https://webapp.ws/Att-App/cpanel/login", '_blank');
      browser.show();
    }
     this.menuCtrl.close();
  }
  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
     // this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
    }
  }
  setLanguage(event){
    let elem= <HTMLInputElement>(document.getElementById('laguage_check'));
    let lang;
    // console.log(elem.checked);
    if(elem.checked==true){
      this.storage.set('language','ar');
      this.translate.use('ar')
      this.changedLanguage='Arabic';
      lang='ar';

    }else{
      this.storage.set('language','en');
      this.translate.use('en')
      this.changedLanguage='English';
      lang='en';
    }
    //this.menuCtrl.close();
    //this.translate.setDefaultLang(this.changedLanguage);
    this.checkRoute();
    this.translate.get(["sidemenu", "alertmessages","app_rate"]).subscribe((response)=>{
        this.lang = response;
        this.initializeApp();
        this.dataProvider.language.emit(lang);
      })
    }

    changeAccount(event){
      this.dataProvider.switchAccount(event,this.lang.switch_account);
      this.menuCtrl.close();
    }
}
