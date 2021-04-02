import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DocumentScanner, DocumentScannerOptions } from '@ionic-native/document-scanner/ngx/';

@Component({
  selector: 'app-share-bulletins',
  templateUrl: './share-bulletins.page.html',
  styleUrls: ['./share-bulletins.page.scss'],
})
export class ShareBulletinsPage implements OnInit {
   	lang:any;
   	bulletin:any={};
   	forward_user_no:any;
   	school_id:any;
   	navData:any={};
   	description:any;

   constructor(public navCtrl: NavController,   
		  	public dataProvider: DataService,
		    public authProvider: AuthService, 
		    public translate: TranslateService,
		    public alertCtrl: AlertController, 
		    public network: Network,
			private route : ActivatedRoute,
			private router:Router,
			private documentScanner: DocumentScanner,
			public zone:NgZone, 
		    public platform: Platform) {
	    this.translate.get("alertmessages").subscribe((response) => {
	      this.lang = response;
	    })
	    this.route.queryParams.subscribe(params => {
	      if (this.router.getCurrentNavigation().extras.state) {
	      		 this.navData = this.router.getCurrentNavigation().extras.state;
	      		 this.bulletin = this.router.getCurrentNavigation().extras.state.bulletin;
	      		 this.forward_user_no = this.router.getCurrentNavigation().extras.state.forward_user_no;
	      		 this.school_id = this.router.getCurrentNavigation().extras.state.school_id;
	      		 console.log(this.navData);
	      }
	    });
	}
	share(){
		let data={
			bulletinId:this.bulletin.bulletin_id,
			forwardedby_user_no:this.forward_user_no,
			school_id:this.school_id,
			description:this.description
		}
		const navigation: NavigationExtras = {
				state : {
				    bulletinId:this.bulletin.bulletin_id,
				    data:data
				  }
				};
		this.zone.run(() => {
		  this.router.navigate(['select-bulletins-user'], navigation);
		});
	}

  ngOnInit() {
  }



}
