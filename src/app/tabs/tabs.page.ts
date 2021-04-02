import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../service/database/database.service';
import { AuthService } from '../service/auth/auth.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit {
	loggedin: boolean = false;
  	activePage: any;
  	isParent=false;
    isStudent=false;
    isteacher=false;
    isTM=false;
  	user = {
	    name: "Guest",
	    description: "Guest",
	    image: "./assets/imgs/logo.png",
	    userType: "guest"
	};
  constructor(public dbProvider: DatabaseService,private authProvider:AuthService) { 
    this.authProvider.event.subscribe(res=>{
        if(res){
           this.dbProvider.openDataBase().then(() => {
            if (localStorage.getItem("userloggedin")) {
              this.loggedin = true;
              this.setUserdetails();
            // console.log(this.user);
              if (this.user.userType == 'parent') {
                this.isParent=true;
                this.isStudent=false;
                this.isTM=false;
                this.isteacher=false;
              } else if(this.user.userType=='student') {
                this.isStudent=true;
                this.isParent=false;
                this.isTM=false;
                this.isteacher=false;
              } else if(this.user.userType=='moderator' ) {
                this.isStudent=false;
                this.isParent=false;
                this.isTM=true;
                this.isteacher=false;
              }else if(this.user.userType=='teacher') {
                this.isStudent=false;
                this.isParent=false;
                this.isTM=true;
                this.isteacher=true;
              }else{
                this.isStudent=false;
                this.isParent=false;
                this.isTM=false;
                this.isteacher=false;

              }
          }
         })
        }
    })
  	    this.dbProvider.openDataBase().then(() => {
          if (localStorage.getItem("userloggedin")) {
            this.loggedin = true;
            this.setUserdetails();
           // console.log(this.user);
            if (this.user.userType == 'parent') {
                this.isParent=true;
                this.isStudent=false;
                this.isTM=false;
              } else if(this.user.userType=='student') {
                this.isStudent=true;
                this.isParent=false;
                this.isTM=false;
              } else if(this.user.userType=='moderator' || this.user.userType=='teacher') {
                this.isStudent=false;
                this.isParent=false;
                this.isTM=true;
              }else{
                this.isStudent=false;
                this.isParent=false;
                this.isTM=false;
              }
        }
       })

        
  }
  setUserdetails() {
    if (localStorage.getItem("userloggedin")) {
      let userDetail = JSON.parse(localStorage.getItem("userloggedin"));
      this.user.name = userDetail.details.first_name + " " + userDetail.details.last_name;
      this.user.image = userDetail.details.pic ? userDetail.details.pic : "./assets/imgs/logo.png";
      this.user.description = userDetail.details.school_name;
      if (userDetail.details.user_type == '1') {
        if(userDetail.details.school_details != ''){
          this.user.description = userDetail.details.school_details;
        }
        this.user.userType = 'admin';
      } else if (userDetail.details.user_type == '2') {
        this.user.userType = 'teacher';
      } else if (userDetail.details.user_type == '3') {
        this.user.userType = 'moderator';
      } else if (userDetail.details.user_type == '4') {
        this.user.userType = 'parent';
      }else if(userDetail.details.user_type == '7') {
        this.user.userType = 'viewer';
      }else if(userDetail.details.user_type == '8') {
        this.user.userType = 'student';
      }
    } else {
      // this.user.name = "Guest";
      // this.user.image = "./assets/imgs/logo.png";
      // this.user.userType = 'guest';
    }
  }
  ngOnInit() {
  }


}
