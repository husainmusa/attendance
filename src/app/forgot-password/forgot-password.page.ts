import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  enterdEmail:any;
  email:any;
  otp:any;
  password:any;
  confirm_password:any;
  enterEmai=true;
  enterPassword=false;
  enterOtp=false;
  canEditEmail=true;
  canEditOTP=true;
  canEditPass=true;
  emailError='';
  otpError='';
  passwordError='';
  confirm_passwordError='';
  lang:any;
  step=0;

  constructor(public navCtrl: NavController, 
		  //	public navParams: NavParams,  
		  	public dataProvider: DataService,
		    public authProvider: AuthService, 
		    //public app: App, 
		    public translate: TranslateService,
		    public alertCtrl: AlertController, 
		    public camera: Camera, 
		    public network: Network,
              private route : ActivatedRoute,
              private router:Router,
              public zone:NgZone, 
		    public platform: Platform) {
  		this.route.queryParams.subscribe(params => {
	      if (this.router.getCurrentNavigation().extras.state) {
	      		 this.enterdEmail = this.router.getCurrentNavigation().extras.state.course;
          //   console.log(this.navData);
	      }
	    });
	    this.translate.get("alertmessages").subscribe((response) => {
      this.lang = response;
    })

  	}
	submitEmail(){
		if(!this.email){
			this.emailError=this.lang.eneter_email;
		}else{
			let data={
				'email':this.email
			}
			this.dataProvider.showLoading();
			this.dataProvider.submitEmail(data).then(res => {
				this.dataProvider.hideLoading();
				if(res.session){
				  this.emailError='';
				  this.canEditEmail=false;
				  this.enterOtp=true;
				  if(this.step==0){
				  	this.step++;
				  }
				  
				}else{
					this.emailError=res.message;
				}
		        console.log('seminar class',res);
		     
    		}).catch(error=>{
    			this.dataProvider.hideLoading();
    			this.dataProvider.showToast(error);
    			console.log(error)
    		})
		}
	}
	submitOtp(){
		if(!this.otp){
			this.otpError=this.lang.eneter_otp;
		}else{
			this.dataProvider.showLoading();
			let data={
				'email':this.email,
				'otp_no'  :this.otp
			}
			this.dataProvider.checkOtp(data).then(res => {
				this.dataProvider.hideLoading();
				if(res.session){
				  this.otpError='';
				  this.canEditOTP=false;
				  this.enterPassword=true;
				  this.step++;
				  setTimeout(res=>{
				  let objDiv = document.getElementById("lastDiv");
					objDiv.scrollTop = objDiv.scrollHeight;
					},100)
				}else{
					this.otpError=res.message;
				}
		        console.log('seminar class',res);
		     
    		}).catch(error=>{
    			this.dataProvider.hideLoading();
    			this.dataProvider.showToast(error);
    			console.log(error)
    		})
			
		}
	}
	submitPassword(){
		if(!this.password){
			this.passwordError=this.lang.password_empty;
		} else if(!this.confirm_password){
			this.passwordError='';
			this.confirm_passwordError=this.lang.confirmP_empty;
		} else if(this.password !== this.confirm_password){
			this.passwordError='';
			this.confirm_passwordError = this.lang.pass_not_match;
		}else{
			let data={
				'email':this.email,
				'password'  :this.password,
				'c_password'  :this.confirm_password
			}
			this.dataProvider.showLoading();
			this.dataProvider.resetPassword(data).then(res => {
				this.dataProvider.hideLoading();
				if(res.session){
					this.step++;
				  this.passwordError='';
				  this.confirm_passwordError = '';
				  this.router.navigate(['login']);
				}else{
					this.passwordError=res.message;
				}
		        console.log('seminar class',res);
		     
    		}).catch(error=>{
    			this.dataProvider.hideLoading();
    			this.dataProvider.showToast(error);
    			console.log(error)
    		})
			

		}
	}
  ngOnInit() {
  }

}
