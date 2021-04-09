import { Component, OnInit } from '@angular/core';
import { NavController, Platform,AlertController } from '@ionic/angular';
import {Location} from '@angular/common';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { SubscriptionService } from '../service/subscription/subscription.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-available-plan',
  templateUrl: './available-plan.page.html',
  styleUrls: ['./available-plan.page.scss'], 
})
export class AvailablePlanPage implements OnInit {
	lang:any;
	plans:any=[];
  userDetails:any;
  availablePlan:any={
    // name: 'Someplan',
    // ammount:'36$',
    // duration:'30 days',
    // startFrom:'1-5-2023',
    // endOn:'7-8-9888',
    // isExpire:true,
    // cardColor:'rgb(249 169 5)' //rgb(249 169 5)  ,#43a047
  };
  constructor(public navCtrl: NavController, 
  	 		      public translate: TranslateService, 
              public dataProvider: DataService, 
              public camera: Camera,
              private route : ActivatedRoute,
              private router:Router,
              public alertCtrl: AlertController,
              private subscriptionService:SubscriptionService,
              private location: Location) {
    this.translate.get("alertmessages").subscribe((res) => {
      this.lang = res;
    })
    this.getPlan();

  }

  ngOnInit() {
    if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.getUserPlan();
    }
  }

  getPlan(){
  	let data={
  		userId:''
  	}
  	this.dataProvider.getPlan(data).then(res=>{
  		this.plans=res;
  		console.log(res);
  	}).catch(e=>{
  		console.log(e);
  		this.plans=e.plans;
  	})
  }

  getUserPlan(){
    let data={
      user_no: this.userDetails.details.user_no,
      school_id: this.userDetails.details.school_id
    }
    this.dataProvider.showLoading();
    this.dataProvider.getUserPlan(data).then((res:any)=>{
      this.dataProvider.hideLoading();
      console.log('plan',res);
      if(res && res.response){
        this.availablePlan=res.response;
        if(res.response.isExpire){
          this.availablePlan.cardColor='rgb(249 169 5)'
        }else{
          this.availablePlan.cardColor='#43a047'

        }
      }else{
        this.availablePlan={}
      }
    }).catch(e=>{
      this.dataProvider.hideLoading();
      console.log(e);
      this.plans=e.plans;
    })
  }

  subscribe(p){
    this.subscriptionService.paymentStatus(p,(res)=>{
      this.subscriptionService.checkout(p);
    });
  //   this.subscriptionService.paymentStatus();
		// this.subscriptionService.checkout(p);
  }

  openPdf(){
    window.open('https://webapp.ws/Att-App/cpanel/uploads/stu_pdf/for_example.pdf', '_system');
  }

}
