import { Component, OnInit } from '@angular/core';
import { NavController, Platform,AlertController } from '@ionic/angular';
import {Location} from '@angular/common';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
// import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { Base64 } from '@ionic-native/base64/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';

import { environment } from '../../environments/environment';
const env = environment;

@Component({
  selector: 'app-add-notes',
  templateUrl: './add-notes.page.html',
  styleUrls: ['./add-notes.page.scss'],
})
export class AddNotesPage implements OnInit {
	 notes: any = {
	 	  sendTo:'',
	    description: '',
	    studentIds: '',
	    ticketImage: '',
	    pdf:'',
	    user_no:'',
	    school_id:'',
	    classId:'',
      type:''
	  };
  lang: any = {};
  userDetails: any = {};
  ticketImage:string = '';
  class_id:any;
  students:any;
  mediaType:any;
  state:any;
  data:any;
  selectedStudent:any;
  formdata:any=new FormData();
  uploadStaus:any;
  studentsId:any=[];
    constructor(public navCtrl: NavController,
    	 		      public translate: TranslateService,
                public dataProvider: DataService,
                public camera: Camera,
                private route : ActivatedRoute,
                private router:Router,
                private file:File,
                // private fileChooser: FileChooser,
                private transfer: FileTransfer,
                private base64: Base64,
                private filePath: FilePath,
                public alertCtrl: AlertController,
                private location: Location) {
    this.translate.get("alertmessages").subscribe((res) => {
      this.lang = res;
    })
    this.route.queryParams.subscribe(params => {
    		if (this.router.getCurrentNavigation().extras.state) {
	      		 this.class_id = this.router.getCurrentNavigation().extras.state.state.course_id;
             this.students= this.router.getCurrentNavigation().extras.state.state.students;
             this.state= this.router.getCurrentNavigation().extras.state.state;
             this.data= this.router.getCurrentNavigation().extras.state.data;
             console.log(this.students);
	        }
	    });
    this.dataProvider.events.subscribe(res=>{
        // console.log(res);
        this.uploadStaus=res;
      })
    }

  /**
   * Ionic navigation event will run when page is loaded
   */
  ionViewWillEnter() {
    this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
  }

  /**
   * Used to send the message
   */

   sendNotes(){
   	if(!this.notes.sendTo){
   		this.dataProvider.showToast(this.lang.select_type);
   	}else{
	    console.log(this.userDetails);
	   	this.notes.classId=this.class_id;
	   	this.notes.user_no=this.userDetails.details.user_no;
	   	this.notes.school_id=this.userDetails.details.school_id;
			console.log(this.notes);
      let media:any;
      if(this.notes.ticketImage && this.notes.ticketImage !=''){
        media=this.notes.ticketImage
      }else{
        media=this.notes.pdf
      }
      if(!media){
        // this.uploadPdfToServer();
        this.startUpload(this.ticketImage);
     }else{
       if(this.notes.pdf!=''){
         // this.uploadPdfToServer();
         this.startUpload(this.ticketImage);
       }else{
         this.startUpload(this.ticketImage);
        // this.uploadNotes(media,this.notes);
       }
     }
   	}
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
            this.openCamera(this.camera.PictureSourceType.CAMERA);
          }
        },
        {
          text: this.lang.gallery,
          handler: ()=>{
            this.openCamera(this.camera.PictureSourceType.PHOTOLIBRARY);
            //this.openGallery()
          }
        }
      ]
    })
  await alert.present();
  }


  openCamera(type){
    let options: CameraOptions = {
            sourceType: type
        }

    this.camera.getPicture(options).then((imageData)=>{
      if(imageData){
        this.notes.pdf='';
        this.notes.ticketImage = imageData;
        this.ticketImage = imageData;
        this.mediaType='image/jpg'
      }
    })
  }



    uploadNotes(media,formData){
        var url = environment.serverURL + 'createNotes';
        console.log('media',media);
        console.log('formData',formData);
        console.log('url',url);
        var filename='';
          if(media){
            var name= media.substr(media.lastIndexOf('/') + 1);
            var splitted = name.split('?');
            filename=splitted[0];
          }
          this.notes.type=this.mediaType;

        formData['studentIds']=(formData.studentIds || [] ).join('#');
        var options: FileUploadOptions = {
          fileName: filename,
          fileKey: 'file',
          mimeType: this.mediaType,
          chunkedMode : false,
          params: formData,
        }
        console.log('upload',options);
        const notesUpload = this.transfer.create();
        this.dataProvider.showLoading();
        notesUpload.upload(media, url, options).then((data) => {
            this.dataProvider.hideLoading();
            this.dataProvider.showToast(this.lang.note_created);
            // this.location.back();
            const navigation: NavigationExtras = {
                state :{
                  isUpdated:true
                }
              };
            console.log(navigation);
            this.router.navigate(['view-notes'], navigation)
        })
        .catch((err)=>{
          this.dataProvider.hideLoading();
          this.dataProvider.showToast(err);
          console.log("Error",err);
        });
  }//EOF uploadData


  async uploadPdf(){
    document.getElementById('myFileInput').click();
  }


  portChange(event){
    this.notes.studentIds=[];
    this.studentsId=[];
    this.selectedStudent.forEach(res=>{
      // console.log(res);
      this.notes.studentIds.push(res.sid);
      this.studentsId.push(res.sid);
    })
    console.log(this.notes.studentIds);

  }
  onSelectFiles(ev:any){
     console.log('ev',ev);
    let files:any = ev && ev.target && ev.target.files ? ev.target.files : <any>{};
    console.log('onSelectFiles',files[0]);
       let ext=files[0].name.split(".").reverse()[0]
       console.log(ext);
       if(ext=='pdf' || ext=='PDF'){
        // this.selectedDocument.push(files[0]);
        this.notes.pdf=files[0];
        this.mediaType='file/pdf';
        this.notes.ticketImage = '';
        this.ticketImage = '';
       }else{
         this.dataProvider.showToast(this.lang.file_format_error);
       }
    console.log('onSelectFiles',this.notes.pdf);
  }

  uploadPdfToServer(imgBlob?:any,fileName?:any){
    this.formdata.append('sendTo', this.notes.sendTo);
    this.formdata.append('description', this.notes.description);
    this.formdata.append('studentIds',(this.notes.studentIds || [] ).join('#'));
    this.formdata.append('ticketImage', this.notes.ticketImage);
    this.formdata.append('pdf', this.notes.pdf);
    this.formdata.append('user_no', this.userDetails.details.user_no);
    this.formdata.append('classId', this.class_id);
    this.formdata.append('school_id', this.userDetails.details.school_id);
    this.formdata.append('type', this.mediaType);
    if(imgBlob){
      this.formdata.append('file', imgBlob, fileName);
    }else{
      this.formdata.append('file', this.notes.pdf);
    }
    console.log(this.formdata);
    // this.dataProvider.showLoading();
        this.dataProvider.createclassNotes(this.formdata).subscribe(res=>{
            console.log("Success",res);
            this.dataProvider.hideLoading();
            this.dataProvider.showToast(this.lang.note_created);
            const navigation: NavigationExtras = {
                state :{
                  isUpdated:true
                }
              };
            console.log(navigation);
            this.router.navigate(['view-notes'], navigation)
        },e=>{
          this.dataProvider.hideLoading();
          this.dataProvider.showToast(this.lang.usnexpectedError);
          this.uploadStaus=false;
        })
  }


  startUpload(imgEntry) {
    this.dataProvider.showLoading();
    if(imgEntry){
      this.file.resolveLocalFilesystemUrl(imgEntry)
          .then(entry => {
              ( < FileEntry > entry).file(file => this.readFile(file))
          })
          .catch(err => {
            this.dataProvider.hideLoading();
              // this.presentToast('Error while reading file.');
          });
    }else{
      this.uploadPdfToServer();
    }
}
 
readFile(file: any) {
  console.log('file',file)
    const reader = new FileReader();
    reader.onload = () => {
        const formData = new FormData();
        const imgBlob = new Blob([reader.result], {
            type: file.type
        });
        console.log('imgBlob',imgBlob,file.name);
        this.uploadPdfToServer(imgBlob,file.name)
        // formData.append('file', imgBlob, file.name);
        // this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
}


  ngOnInit() {
  }

}
