import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import {DocumentService} from '../service/document/document.service';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'app-view-bulletin',
  templateUrl: './view-bulletin.page.html',
  styleUrls: ['./view-bulletin.page.scss'],
})
export class ViewBulletinPage implements OnInit {
	userDetails:any;
	lang:any;
	navData:any
	user_no:any;
	bulletinDetails:any={};
  comment:any;
  visibleComment=false;
  constructor(public navCtrl: NavController,   
	  	  	  	public dataProvider: DataService,
			      public authProvider: AuthService,
			      public translate: TranslateService,
			      public alertCtrl: AlertController,
			      public network: Network,
			        private photoViewer: PhotoViewer,
			        private route : ActivatedRoute,
			        private router:Router,
			        private documentService:DocumentService,
			        public zone:NgZone, 
				      public platform: Platform) {

	  			this.translate.get("alertmessages").subscribe((response) => {
			      this.lang = response;
			    })

			    this.route.queryParams.subscribe(params => {
			      if (this.router.getCurrentNavigation().extras.state) {
			      		this.navData = this.router.getCurrentNavigation().extras.state;
			      		console.log(this.navData);
			      	//	this.markasReads();
			      }
			    });

			}

  ngOnInit() {
  	if(localStorage.getItem("userloggedin")){
        this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
        this.user_no = this.userDetails.details.user_no;
        this.getBulletin();
  	}
  }
  openCommentSection(navData){
    this.visibleComment=true;
  }
  openPdf(pdf:string){
    //   let link='https://docs.google.com/viewer?url='+pdf;
    // console.log(link);
    // window.open(link, '_system');
      window.open(pdf, '_system');
     // this.documentService.openPdf(pdf,true);
  }
  opendoc(pdf){
    let link='https://docs.google.com/viewer?url='+pdf;
    console.log(link);
    window.open(link, '_system');
  }
  
  openPdfs(pdf:string){
      
      window.open(pdf+'.pdf', '_system');
     //this.documentService.openPdf(pdf,true);
  }
  openImage(image){
   this.photoViewer.show(image); 
  }
	getBulletin(){
		let data ={
			user_no:this.user_no,
			b_id:this.navData.bulletin_id
		}
		this.dataProvider.showLoading();
		this.dataProvider.getBulletinDetails(data).then(res=>{
			this.bulletinDetails=res.data;
			this.dataProvider.hideLoading();
			console.log(this.bulletinDetails);
		},e=>{
			this.dataProvider.hideLoading();
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
	markasReads(){
		let data ={
			user_no:this.userDetails.details.user_no,
			bulletin_id:this.navData.id
		}
		this.dataProvider.markBulletinRead(data).then(res=>{
			console.log(res);
		})
	}
  markComment(){
    let data={
      bulletinId: this.navData.bulletin_id,
      forwardedby_user_no:this.userDetails.details.user_no,
      school_id: this.userDetails.details.school_id,
      description: this.comment
    }
    this.dataProvider.commentBulletins(data).then(res=>{
      this.dataProvider.showToast(res.message);
      this.getBulletin();
      this.visibleComment=false;
      this.comment='';
    }).catch(re=>{
      console.log(re);
    })
  }

	async deleteBulletin(){
     const alert= await this.alertCtrl.create({
      header: this.lang.delete_bulletin,
      backdropDismiss: true,
      mode:'ios',
      buttons: [
        {
          text: this.lang.delete,
          handler: ()=>{
          	
               	let data ={
									user_no:this.userDetails.details.user_no,
									b_id:this.navData.bulletin_id
								}
								this.dataProvider.deleteBulletin(data).then(res=>{
									console.log(res);
									this.router.navigate(['bulletins']);
								})
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

 async reOpen(){
  	const alert= await this.alertCtrl.create({
      header: this.lang.sure,
      backdropDismiss: true,
      mode:'ios',
      buttons: [
        {
          text: this.lang.reopen_bulletin,
          handler: ()=>{
          	
               	let data ={
									user_no:this.userDetails.details.user_no,
									b_id:this.navData.bulletin_id
								}
								this.dataProvider.reOpenBulletin(data).then(res=>{
									console.log(res);
									this.getBulletin();
								})
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

  completeBulletin(){
  	let data ={
				user_no:this.userDetails.details.user_no,
				b_id:this.navData.bulletin_id
			}
		this.dataProvider.closeBulletin(data).then(res=>{
			console.log(res);
			this.getBulletin();
		})
  }

}
 