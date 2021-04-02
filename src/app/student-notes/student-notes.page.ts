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

@Component({
  selector: 'app-student-notes',
  templateUrl: './student-notes.page.html',
  styleUrls: ['./student-notes.page.scss'],
})
export class StudentNotesPage implements OnInit {
	lang:any;
	category:any;
	userDetails:any;
	userType:any;
  notes:any;
  noData=false;
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
              public modalCtrl: ModalController) {
            this.authProvider.event.subscribe((res)=>{
                  console.log('change',res)
                  if(res.changeUser){
                    this.ionViewWillEnter();
                  }
                })
                this.translate.get("alertmessages").subscribe((res)=>{
                  this.lang = res;
                  console.log(this.lang);
                })
                this.dataProvider.language.subscribe((resq)=>{
                  this.translate.get("alertmessages").subscribe((res)=>{
                     // console.log(this.lang);
                    this.lang = res;
                  })
                })
  }

  ngOnInit() {
  }
    showPhoto(url){
    this.photoViewer.show(url);
  }

   ionViewWillEnter(){
       // this.dataProvider.showLoading();
    if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      console.log('this',this.userDetails);
      this.userType = this.userDetails.details.user_type;
      this.getClassNotes();
    }else{
      this.dataProvider.hideLoading();
      console.log('not logged in');
      this.authProvider.flushLocalStorage();
      this.router.navigate(['login'], { replaceUrl: true });
    }
  }
  doRefresh(event) {
    console.log('Begin async operation');
    this.getClassNotes();
    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }

  getClassNotes(){
  	let data = {
      "student_id": this.userDetails.details.stu_id,
      "school_id": this.userDetails.details.school_id,
      "session_id": this.userDetails.session_id
    };
    this.dataProvider.getClassNotes(data).then(res=>{
    	console.log('notes',res);
      this.notes=res;
      if(this.notes){
        if(this.notes.length<1){
        console.log('notes',res);
          this.noData=true;
        }else{
          this.noData=false;

        }
      }else{
      console.log('notes',res);
          this.noData=true;

      }
    }).catch(Error=>{
      // this.dataProvider.showToast(Error);
    	console.log(Error);
    })
  }
    openPdf(pdf:string){
    //  window.open(pdf,'_blank')
    window.open(pdf, '_system');
    //this.documentService.openPdf(pdf,true);
  }

}
