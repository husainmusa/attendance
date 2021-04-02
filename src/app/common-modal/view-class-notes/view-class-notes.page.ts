import { Component, OnInit, Input,NgZone } from '@angular/core';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../../service/auth/auth.service';
import { DataService } from '../../service/data/data.service';
import { DatabaseService } from '../../service/database/database.service';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {CreateClassPage } from '../../create-class/create-class.page';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import {DocumentService} from '../../service/document/document.service';
@Component({
  selector: 'app-view-class-notes',
  templateUrl: './view-class-notes.page.html',
  styleUrls: ['./view-class-notes.page.scss'],
})
export class ViewClassNotesPage implements OnInit {
	@Input() data;
  @Input() state;
	lang:any;
  userDetails:any;
  userType:any;
  navData:any;
  notes:any;
  
   constructor(public navCtrl: NavController, 
             // public app: App, 
              public translate: TranslateService,
             public dataProvider: DataService, 
              public authProvider: AuthService,  
              //public events: Events,
              private documentService:DocumentService,
              public alertCtrl: AlertController, 
              private route : ActivatedRoute,
              private photoViewer: PhotoViewer,
              public zone:NgZone,
              private router:Router,
              public modalController: ModalController) {
                this.translate.get("alertmessages").subscribe((res)=>{
                  this.lang = res;
                })
      this.route.queryParams.subscribe(params => {
        if (this.router.getCurrentNavigation().extras.state) {
             this.navData = this.router.getCurrentNavigation().extras.state.course;
            console.log(this.navData);
        }
      });
              }

  ngOnInit() {
    console.log('moda',this.data);
  }
  cloeModal(){
  	this.modalController.dismiss();
  }
  showPhoto(url){
    console.log(url);
    this.photoViewer.show(url);
  }
  ionViewWillEnter(){
      if (localStorage.getItem("userloggedin")) {
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.userType = this.userDetails.details.user_type;
    }
  }

    addNotes(){
      this.cloeModal();
    const navigation: NavigationExtras = {
            state :{
              state:this.state,
              data:this.data
            }
            
          };
        //console.log(navigation);
        this.zone.run(() => {
          this.router.navigate(['add-notes'], navigation);
        });
    //this.router.navigate(['add-notes']);
  }
  
  openPdf(pdf){
    //  window.open(pdf,'_blank')
   // this.documentService.openPdf(pdf,true);
   window.open(pdf, '_system');
  }
    async deleteNote(note){
     const alert= await this.alertCtrl.create({
      header: this.lang.delete_note,
      backdropDismiss: true,
      mode:'ios',
      buttons: [
        {
          text: this.lang.delete,
          handler: ()=>{
                   console.log(note);
                    let data={
                      note_id:note.notes_id
                    }
                    this.authProvider.deleteNote(data);
                    this.cloeModal();

          }
        },
        {
          text: this.lang.alert_btn_cancel_text,
          handler: ()=>{
             

          }
        }
      ]
    }) 
   await alert.present();
  }

    getAllClassNotes(){
      let course = this.navData;
      let studentData = {
        "user_no": this.userDetails.details.user_no,
        "session_id": this.userDetails.session_id,
        "course_id": course.cid,
        "school_id": this.userDetails.details.school_id,
      }
      this.dataProvider.getAllClassNotes(studentData).then(res=>{
        console.log(res);
        if(res){
         // this.dataProvider.viewNotes(res);
         this.notes=res;
        }
      }).catch(error=>{
        console.log(error);
      })
    }

}
