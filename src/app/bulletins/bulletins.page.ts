import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DocumentScanner, DocumentScannerOptions } from '@ionic-native/document-scanner/ngx/';
import {DocumentService} from '../service/document/document.service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { PopoverController } from '@ionic/angular';
import {LoaderComponent} from '../components/loader/loader.component';


@Component({
  selector: 'app-bulletins',
  templateUrl: './bulletins.page.html',
  styleUrls: ['./bulletins.page.scss'], 
}) 
export class BulletinsPage implements OnInit {
	lang:any;
	userDetails:any;
	userType:any;
  bulletins:any=[];
  allBullentins:any=[];
  user_no:any;
  popOver:any;
   constructor(public navCtrl: NavController,
	  	        public dataProvider: DataService,
	            public authProvider: AuthService,
      		    public translate: TranslateService,
      		    public alertCtrl: AlertController, 
      		    public camera: Camera, 
      		    public network: Network,
              private photoViewer: PhotoViewer,
              private route : ActivatedRoute,
              private router:Router,
              private documentService:DocumentService,
              private documentScanner: DocumentScanner,
              public zone:NgZone,
              public popoverController: PopoverController,
              private fileOpener: FileOpener, 
      		    public platform: Platform) {
	    this.translate.get("alertmessages").subscribe((response) => {
	      this.lang = response;
	    })
      // this.presentPopover();
	}

  ngOnInit() {
  }
  ionViewWillEnter(){
  	  	if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType=this.userDetails.details.user_type;
      this.user_no=this.userDetails.details.user_no;
      this.getBulletins();
  	}

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
    this.popOver.dismiss();
  }
  addBulletin(){
  	this.router.navigate(['follow-bulletins']);
  }
  openImage(image){
   this.photoViewer.show(image); 
  }
  getMIMEtype(extn){
  let ext=extn.toLowerCase();
  let MIMETypes={
    'txt' :'text/plain',
    'docx':'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc' : 'application/msword',
    'pdf' : 'application/pdf',
    'jpg' : 'image/jpeg',
    'bmp' : 'image/bmp',
    'png' : 'image/png',
    'xls' : 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'rtf' : 'application/rtf',
    'ppt' : 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  }
  return MIMETypes[ext];
}
  opendoc(pdf){
    let link='https://docs.google.com/viewer?url='+pdf;
    console.log(link);
    window.open(link, '_system');
  }
  openBulletin(bullet){
    console.log(bullet);
    const navigation: NavigationExtras = {
            state : bullet
          };
        this.zone.run(() => {
          this.router.navigate(['view-bulletin'], navigation);
        });
  }

  getBulletins(){
    let data={
      user_no:this.userDetails.details.user_no,
      school_id:this.userDetails.details.school_id
    }
    this.presentPopover();
    this.dataProvider.getBulletins(data).then(res=>{
      this.dissmissPopOver();
     if(res){
      this.bulletins=res.data;
      if(this.bulletins){
        if(this.bulletins.length > 1){
              this.allBullentins = this.bulletins.splice(0, 20);
            }else{
              this.allBullentins = this.bulletins;
            }
            console.log(this.allBullentins);
       }
      }
    }).catch(e=>{
      this.dissmissPopOver();
      console.log(e);
    })
  }
  shareBulletin(bullet){
    const navigation: NavigationExtras = {
        state : {
            bulletin: bullet,
            forward_user_no:this.userDetails.details.user_no,
            school_id:this.userDetails.details.school_id
          }

        };
        this.zone.run(() => {
          this.router.navigate(['share-bulletins'], navigation);
        });
  }

  doInfinite(infiniteScroll:any) {
    setTimeout(() => {
      this.allBullentins = this.allBullentins.concat(this.bulletins.splice(0, 20));
      infiniteScroll.target.complete();
    }, 500);
  }
  openPdf(pdf:string){
    // let link='https://docs.google.com/viewer?url='+pdf;
    // console.log(link);
    // window.open(link, '_system');
      window.open(pdf, '_system');
     // this.documentService.openPdf(pdf,true);
  }
  openPdfs(pdf:string){
      
      window.open(pdf+'.pdf', '_system');
     //this.documentService.openPdf(pdf,true);
  }

}


