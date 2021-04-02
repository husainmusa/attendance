import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, NavParams, AlertController, Platform } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
@Component({
  selector: 'app-follow-bulletins',
  templateUrl: './follow-bulletins.page.html',
  styleUrls: ['./follow-bulletins.page.scss'],
})
export class FollowBulletinsPage implements OnInit {
	lang:any;
	allUsers:any=[];
  users:any;
  tital:any;
	selectedUsers:any;
	userDetails:any={};
	formdata:any=new FormData();
	selectedDocument:any=[];
  inputText=true;
  inputUser=false;
  uploadStaus:any;
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
        public formBuilder: FormBuilder,
        public zone:NgZone, 
		    public platform: Platform) {
	    this.translate.get("alertmessages").subscribe((response) => {
	      this.lang = response;
	    })
      this.dataProvider.events.subscribe(res=>{
        console.log(res);
        this.uploadStaus=res;
      })
	}

  ngOnInit() {
     
  	if(localStorage.getItem("userloggedin")){
      this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
      this.getUsers();
  	}
  }
  cahnge(){
    console.log(this.formdata);
  }
  openUser(){
    if(this.checkForm()){
      this.inputText=false;
      this.inputUser=true;
    }
  }
  markUser(users){
    console.log(users);
    if(this.userDetails.details.user_no != users.user_no){
      this.selectedUsers=users.user_no;
    }else{
      this.dataProvider.showToast(this.lang.same_user)
    }
   
  }
  onSelectFiles(ev:any){    
     // console.log('ev',ev);
    let files:any = ev && ev.target && ev.target.files ? ev.target.files : <any>{};
    // console.log('onSelectFiles',files); 
    for(let i=0; i<5; i++){
     if(files[i]){
       let ext=files[i].name.split(".").reverse()[0]
       console.log(ext);
       if(ext=='jpg' || ext=='png' || ext=='doc' || ext=='docx' || ext=='pdf'){
        files[i].extention=ext;
        this.selectedDocument.push(files[i]);
       }else{
         this.dataProvider.showToast(this.lang.file_format_error);
       }
     }
    }
    console.log('onSelectFiles',this.selectedDocument);    
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

  doInfinite(infiniteScroll:any) {
    setTimeout(() => {
      this.allUsers = this.allUsers.concat(this.users.splice(0, 20));
      infiniteScroll.target.complete();
    }, 500);
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



  scanDocument(){
    document.getElementById('myFileInput').click()
  }

  removeImage(i){
  	this.selectedDocument.splice(i,1);
    console.log(this.selectedDocument);
  }
  submit(){
    this.formdata.append('school_id', this.userDetails.details.school_id);
    this.formdata.append('sended_by', this.userDetails.details.user_no);
    this.formdata.append('sended_to', this.selectedUsers);
    this.formdata.append('tital', this.tital);
    for(let k in this.selectedDocument){
      this.formdata.append('files[]', this.selectedDocument[k]);
    }
     this.dataProvider.showLoading();
        // this.dataProvider.createBulletins(this.formdata).then(res=>{
        //   this.dataProvider.hideLoading();
        //     console.log(res);
        //     this.dataProvider.showToast(res.message);
        //     this.router.navigate(['bulletins']);
        //   }).catch(err=>{
        //     this.dataProvider.showToast(err.message);
        //     console.log(err);
        //   })
        this.dataProvider.createBulletins(this.formdata).subscribe(res=>{
          this.dataProvider.hideLoading();
          console.log(res);
          this.router.navigate(['bulletins']);
        },e=>{
          this.dataProvider.hideLoading();
        })

  }

  checkForm(){
  	if(!this.selectedDocument){
  		this.dataProvider.showToast(this.lang.doc_error);
  		return(false)
  	}else if(this.selectedDocument.length<1){
      this.dataProvider.showToast(this.lang.doc_error);
      return(false)
    }
    else if(!this.tital || this.tital==''){
  		this.dataProvider.showToast(this.lang.title_error);
  		return(false)
  	}
    else{
  		return(true);
  	}
  }

}
