import { Component, OnInit,NgZone } from '@angular/core';
import { NavController, Platform,AlertController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';


import { environment } from '../../environments/environment';
const env = environment;
// import{SelectMessageUserPage} from '../common-modal/select-message-user/select-message-user.page'
// import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sendmessage',
  templateUrl: './sendmessage.page.html',
  styleUrls: ['./sendmessage.page.scss'],
})
export class SendmessagePage implements OnInit {
 mail: any = {
    send_to: {
      parents: false,
      mod: false,
      tech: false,
      others: false,
      admin: false,
      viewer: false
    },
    title: '',
    notification: '',
    useremailorid: '',
    selected_users:[]
  };
  lang: any = {};
  userDetails: any = {};
  ticketImage:string = '';
  users:any=[];
  selectedUsers:any;
  mediaType:any;
  selectedUsersShow:any=[];
  formdata:any=new FormData();
  /**
   * 
   * @param navCtrl Navigation controller
   * @param translate used from translation messages
   * @param dataProvider data provider
   * @param camera used for taking images
   * @param alertCtrl use for alert popup
   */
  constructor(public navCtrl: NavController, 
  	 		  public translate: TranslateService, 
              public dataProvider: DataService, 
              public camera: Camera,
              public zone:NgZone,
              private router: Router,
              private route : ActivatedRoute,
              private transfer: FileTransfer,
                private file:File,
              // public modalController: ModalController,
              public alertCtrl: AlertController) {
    // this.route.queryParams.subscribe(params => {
    //     if (this.router.getCurrentNavigation().extras.state) {
    //          this.mail.selected_users = this.router.getCurrentNavigation().extras.state; 
    //     }
    //   });
    this.dataProvider.selectedUsers.subscribe(res=>{
      this.mail.selected_users = res.selectedUsers;
      this.selectedUsersShow = res.selectedUsersShow;
             console.log(this.mail.selected_users); 
             console.log(res); 
             // this.getUsers();    
    })
    this.translate.get("alertmessages").subscribe((res) => {
      this.lang = res;
    })
  }

  /**
   * Ionic navigation event will run when page is loaded
   */ 
  ngOnInit() {
   
  }
  ionViewWillEnter() {
     this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
     this.ticketImage = '';
    this.getUsers();
      }


 async selectUserpage(){
    const navigation: NavigationExtras = {
            state : this.users
          };
    this.zone.run(() => {
      this.router.navigate(['select-message-user'], navigation);
    });
  }

  /**
   * Used to send the message
   */
   moveBack(){
     this.router.navigate(['tabs/messages']);
   }

  getUsers(){
    let data={
      'school_id':this.userDetails.details.school_id
    }
    this.dataProvider.showLoading();
  this.dataProvider.getAllSchoolUsers(data).then(res => {
    this.dataProvider.hideLoading();
        console.log('seminar class',res);
        if(res.data){
          this.users=res.data;
        }
     
  }).catch(error=>{
    this.dataProvider.hideLoading();
    this.dataProvider.showToast(error);
    console.log(error)
  })
  }


  sendMessage() {
    if (!this.mail.send_to.parents && !this.mail.send_to.mod && !this.mail.send_to.tech && !this.mail.send_to.others && !this.mail.send_to.admin && !this.mail.send_to.viewer) {
      this.dataProvider.showToast(this.lang.select_user);
    } 
    // else if (this.mail.title && this.mail.title.trim() == '') {
    //   this.dataProvider.showToast(this.lang.enter_title);
    // } else if(this.mail.title.length > 35){
    //   this.dataProvider.showToast(this.lang.max_title);
    // }
    else if (this.mail.notification && this.mail.notification.trim() == '') {
      this.dataProvider.showToast(this.lang.enter_noti_desc);
    } else if(this.mail.notification.length > 140){
      this.dataProvider.showToast(this.lang.max_body);
    }else {
      if (this.mail.send_to.others && (this.mail.selected_users.length<1)) {
        this.dataProvider.showToast(this.lang.enter_email_userid);
      } else if (this.mail.send_to.others) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        let isEmail = re.test(this.mail.one_user_email);
        if (this.mail.selected_users.length>0) {  // check for email of selected user
          let isemailvar = 1;
                let data = {
                  user_no: this.userDetails.details.user_no,
                  session_id: this.userDetails.session_id,
                  notification: this.mail,
                  isemail: isemailvar,
                  school_id: this.userDetails.details.school_id
                }
                this.startUpload(this.ticketImage,data);
        } else {  // if entered email is user id
          // this.dataProvider.showLoading();
          this.dataProvider.postRequest({}, 'exist_usern/' + this.mail.one_user_email).then((response) => {
            if (response.success) {
              if (response.user.username) {
                let isemailvar = 0;
                let data = {
                  user_no: this.userDetails.details.user_no,
                  session_id: this.userDetails.session_id,
                  notification: this.mail,
                  isemail: isemailvar,
                  school_id: this.userDetails.details.school_id
                }
                this.startUpload(this.ticketImage,data);
              } else {
                // this.dataProvider.hideLoading();
                this.dataProvider.showToast(this.lang.user_not_exist)
              }
            }
          })
        }
      } else {
        let isemailvar = 2;
        let data = {
          user_no: this.userDetails.details.user_no,
          session_id: this.userDetails.session_id,
          notification: this.mail,
          isemail: isemailvar,
          school_id: this.userDetails.details.school_id
        };
        this.startUpload(this.ticketImage,data);
        // this.uploadMessage(data,this.ticketImage);
      }
    }
  }


  uploadToServer(data,imgBlob?:any,fileName?:any){
    console.log(data);
    this.formdata.append('user_no', data.user_no);
    this.formdata.append('session_id', this.userDetails.session_id);
    Object.keys(data.notification).map((key) => {
      if (key == 'send_to') {
        Object.keys(data.notification[key]).map((send_to_key) => {
          this.formdata.append('notification[' + key + '][' + send_to_key + ']', data.notification[key][send_to_key]);
        })
      } else {
        this.formdata.append('notification[' + key + ']', data.notification[key]);
      }
    })
    this.formdata.append('isemail', data.isemail);
    this.formdata.append('school_id', this.userDetails.details.school_id);
    if(imgBlob){
      this.formdata.append('file', imgBlob, fileName);
    }
    console.log(this.formdata);
    // this.dataProvider.showLoading();
        this.dataProvider.sendMessage(this.formdata,data.school_id).subscribe(res=>{
          this.dataProvider.hideLoading();
            console.log("Success",res);
            this.dataProvider.showToast(this.lang.msg_sent_success);
             this.mail = {
              send_to: {
                parents: false,
                mod: false,
                tech: false,
                others: false,
                admin: false,
                viewer: false
              },
              title: '',
              notification: '',
              useremailorid: ''
            };
            this.ticketImage = '';
            this.router.navigate(['tabs/messages']);
        },e=>{
            this.dataProvider.hideLoading();
             this.mail = {
              send_to: {
                parents: false,
                mod: false,
                tech: false,
                others: false,
                admin: false,
                viewer: false
              },
              title: '',
              notification: '',
              useremailorid: ''
            };
            this.ticketImage = '';
            this.router.navigate(['tabs/messages']);
            this.dataProvider.showToast(this.lang.usnexpectedError);
        })
  }


  startUpload(imgEntry,data) {
    this.dataProvider.showLoading();
    if(imgEntry){
      this.file.resolveLocalFilesystemUrl(imgEntry).then(entry => {
              ( < FileEntry > entry).file(file => this.readFile(file,data))
          })
          .catch(err => {
              // this.presentToast('Error while reading file.');
          });
    }else{
      this.uploadToServer(data);
    }
}
 
readFile(file: any,data) {
  console.log('file',file)
    const reader = new FileReader();
    reader.onload = () => {
        const formData = new FormData();
        const imgBlob = new Blob([reader.result], {
            type: file.type
        });
        console.log('imgBlob',imgBlob,file.name);
        this.uploadToServer(data,imgBlob,file.name)
        // formData.append('file', imgBlob, file.name);
        // this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
}



portChange(event){
  let user=[];
  console.log(event);
  event.value.forEach(res=>{
    console.log(res);
    user.push(res.user_no);
  })
  console.log(user);
  this.mail.selected_users=user;
  this.getUsers();
}

  /**
   * alert to show image take choice
   */
 async takePicture(){
  const alert=await this.alertCtrl.create({
      header: this.lang.image_option,
      buttons: [
        {
          text: this.lang.camera,
          handler: ()=>{
            this.openCamera();
          }
        },
        {
          text: this.lang.gallery,
          handler: ()=>{
            this.openGallery()
          }
        }
      ]
    })
  await alert.present();
  }

  /**
   * mobile camera to take image 
   */
  openCamera(){
    
     let options: CameraOptions = {
            quality: 100,
            sourceType: this.camera.PictureSourceType.CAMERA
        }

    this.camera.getPicture(options).then((imageData)=>{
      if(imageData){
        this.ticketImage = imageData;
        this.mediaType='image/jpg'
      }
    })

  }

  /**
   * Open gallery to take image
   */
  openGallery(){
    let options: CameraOptions = {
            quality: 100,
            sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
        }

    this.camera.getPicture(options).then((imageData)=>{
      if(imageData){
        this.ticketImage = imageData;
        this.mediaType='image/jpg'
      }
    })
  }


}
