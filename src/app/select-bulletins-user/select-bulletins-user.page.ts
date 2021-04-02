import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-select-bulletins-user',
  templateUrl: './select-bulletins-user.page.html',
  styleUrls: ['./select-bulletins-user.page.scss'],
})
export class SelectBulletinsUserPage implements OnInit {
	userdata:any;
	lang:any;
	allUsers:any=[];
	users:any=[];
	formData:any={};
	userDetails:any={};
  data:any;
  bulletinId:any;
  selectedUsers:any=[];
  type:any;
    constructor(public navCtrl: NavController, 
		  	public dataProvider: DataService,
		    public translate: TranslateService,
		    public alertCtrl: AlertController, 
			private route : ActivatedRoute,
			private router:Router,
			public zone:NgZone, 
		    public platform: Platform) {
  		this.route.queryParams.subscribe(params => {
	      if (this.router.getCurrentNavigation().extras.state) {
	      		 this.formData = this.router.getCurrentNavigation().extras.state.formdata;
             this.type = this.router.getCurrentNavigation().extras.state.type;
             this.data = this.router.getCurrentNavigation().extras.state.data;
             this.bulletinId = this.router.getCurrentNavigation().extras.state.bulletinId;
	      		 console.log(this.formData);
	      }
	    });
	    this.translate.get("alertmessages").subscribe((response) => {
	      this.lang = response;
	    });
	}
	ngOnInit() {
	}
	ionViewWillEnter(){
  	  	if(localStorage.getItem("userloggedin")){
	      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
	      this.getUsers();
	      console.log()
	  	}
	}
  getUsers(){
  	let data={
  		'school_id':this.userDetails.details.school_id
  	}
  	this.dataProvider.showLoading();
	this.dataProvider.getSchoolUsers(data).then(res => {
		this.dataProvider.hideLoading();
        console.log('seminar class',res);
        if(res.data){
        	this.users=res.data;
          if(this.users.length > 1){
            this.allUsers = this.users.splice(0, 20);
          }else{
            this.allUsers = this.users;
          }
        }
     
	}).catch(error=>{
		this.dataProvider.hideLoading();
		this.dataProvider.showToast(error);
		console.log(error)
	})
  }

    filterList(event){
    //this.selectTopic=[];
    let input = (<HTMLInputElement>document.getElementById('search')).value;
    console.log(input);

    let data={
    	input:input,
    	school_id:this.userDetails.details.school_id
    }
    this.dataProvider.searchUser(data).then(resp=>{
    	if(resp.data){
        	this.users=resp.data;
          if(this.users.length > 1){
            this.allUsers = this.users.splice(0, 20);
          }else{
            this.allUsers = this.users;
          }
        }
    }).catch(arr=>{
    	console.log(arr)
    })
  }
  selectUser(users,eve,id){
    console.log(users);
    let isPresent=false;
    let ind;
    for (let i = 0; i < this.selectedUsers.length; i++) {
      if(this.selectedUsers[i]==users.user_no){
        isPresent=true;
        ind=i;
      }
    }
    if(eve.detail.checked==true){
      if(!isPresent){
        if(users.user_no!=this.userDetails.details.user_no){
          this.selectedUsers.push(users.user_no)
        }else{
         this.dataProvider.showToast(this.lang.same_user);
         let elem= <HTMLFormElement>(document.getElementById('ch'+id));
          elem.checked=false;
        }
      }
    }else{
      if(isPresent){
        this.selectedUsers.splice(ind,1);
      }
    }
     console.log(this.selectedUsers);
  }

  uplaodBullentin(user){
    console.log(user);
      if(this.bulletinId){
        this.data.users=this.selectedUsers;
        // this.data.shareto_user_no=user.user_no;
        console.log(this.data);
        this.dataProvider.showLoading();
        this.dataProvider.shareBulletins(this.data).then(res=>{
          this.dataProvider.hideLoading();
            console.log(res);
            this.dataProvider.showToast(res.message);
            this.router.navigate(['bulletins']);
          }).catch(err=>{
            this.dataProvider.showToast(err.message);
          this.dataProvider.hideLoading();
            console.log(err);
          })
      }else{
        if(user.user_no!=this.userDetails.details.user_no){
        this.formData.users=user;
        console.log('this.formdata',this.formData);
        this.dataProvider.showLoading();
        this.dataProvider.createBulletins(this.formData).subscribe(res=>{
          this.dataProvider.hideLoading();
            console.log(res);
            this.dataProvider.showToast(res.message);
            this.router.navigate(['bulletins']);
          },err=>{
            this.dataProvider.showToast(err.message);
          this.dataProvider.hideLoading();
            console.log(err);
          })
      }else{
      this.dataProvider.showToast(this.lang.same_user)
      }
    }
    
  }
  doInfinite(infiniteScroll:any) {
    setTimeout(() => {
      this.allUsers = this.allUsers.concat(this.users.splice(0, 20));
      infiniteScroll.target.complete();
    }, 500);
  }

}
