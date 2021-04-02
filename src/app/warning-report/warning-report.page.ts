import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { DatabaseService } from '../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {CreateClassPage } from '../create-class/create-class.page';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import {DocumentService} from '../service/document/document.service';

import { Printer, PrintOptions } from '@ionic-native/printer/ngx';

@Component({
  selector: 'app-warning-report',
  templateUrl: './warning-report.page.html',
  styleUrls: ['./warning-report.page.scss'],
})
export class WarningReportPage implements OnInit {
	userDetails:any={};
	reportData:any=[];
  constructor(public navCtrl: NavController,
  	         // public app: App,
  	          public translate: TranslateService,
              public dataProvider: DataService,
              public authProvider: AuthService,
              //public events: Events,
              public alertCtrl: AlertController,
              private route : ActivatedRoute,
              private documentService:DocumentService,
              public zone:NgZone,
              private router:Router,
              private photoViewer: PhotoViewer,
          	  private printer: Printer,
              public modalCtrl: ModalController) {
              }

  ngOnInit(loader:boolean=true) {
  }
  ionViewWillEnter(){
    if (localStorage.getItem("userloggedin")) {
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.getAllWarning();
    }
  }
  getAllWarning(loader:boolean=true){
      let data = {
        "user_no": this.userDetails.details.user_no,
        "session_id": this.userDetails.session_id,
        "school_id": this.userDetails.details.school_id,
      }
      if(loader) this.dataProvider.showLoading();
      this.dataProvider.getAllWarning(data).then(res=>{ 
        this.dataProvider.hideLoading();
        console.log(res);
        if(res){
         // this.dataProvider.viewNotes(res);
         this.reportData=res;
        }
      }).catch(error=>{
        this.dataProvider.hideLoading();
        console.log(error);
      })
  }
  printReport(i){
    console.log(i);
  	let data = {
        "user_no": this.userDetails.details.user_no,
        "session_id": this.userDetails.session_id,
        "school_id": this.userDetails.details.school_id,
        "report_number": i+1
      }
      this.dataProvider.showLoading();
      this.dataProvider.printWarning(data).then(res=>{
        this.dataProvider.hideLoading();
        console.log(res);
        if(res){
        	let options: PrintOptions = { orientation: 'portrait'};
	        this.printer.print(res.url,options).then((onSuccess:any)=>{
	           console.log('printer.print',onSuccess)
	        },(e:any)=>{
	           console.log('printer.print',e)
	        });
          // window.open(res.url, '_system');
        }else{
          this.dataProvider.showToast('Unable to generate report');
        }
      }).catch(error=>{
        this.dataProvider.hideLoading();
        this.dataProvider.showToast('Unable to generate report');
        console.log(error);
      })
  }

}
