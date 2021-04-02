import { Component, OnInit } from '@angular/core';
import { NavController, Platform,AlertController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { FileUploadService } from '../service/file-upload/file-upload.service';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { TranslateService } from '@ngx-translate/core';
import { Router} from '@angular/router';
import { LocationService } from '../service/location/location.service';
// import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions,CaptureVideoOptions } from '@ionic-native/media-capture/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { DomSanitizer } from '@angular/platform-browser';
import {GeoServiceProvider} from '../service/geo-service/geo-service';

import { environment } from '../../environments/environment';
const env = environment;
@Component({
  selector: 'app-post-news',
  templateUrl: './post-news.page.html',
  styleUrls: ['./post-news.page.scss'],
})
export class PostNewsPage implements OnInit {
	news={
		'title':'Title',
		'news_description':'',
    'user_no':'',
    'user_type':'',
    'type':'',
    'school_id':'school_id',
    'countryCode':''
	}
  media:any;
  mediaName:any;
  mediaKey:any;
  mediaType:any;
  safeUrl:any;
  lang: any = {};
  userDetails: any = {};
  country_code:any;
  location_lang:any;
  items:any;
  videoFileUpload:any;
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
              public locationSrevice:LocationService,
              private router: Router,
              private file:File,
              private geo:GeoServiceProvider,
              private mediaCapture: MediaCapture, 
              private fileUpload:FileUploadService,
              // private fileChooser: FileChooser,
              private transfer: FileTransfer,
              public alertCtrl: AlertController,
              private DomSanitizer: DomSanitizer) {
    this.translate.get("alertmessages").subscribe((res) => {
      this.lang = res;
    })

    this.translate.get("location").subscribe((res)=>{
      this.location_lang = res;
    })
    this.getLocation()
  }

  getLocation(){
    // this.locationSrevice.checkGPSPermission(resp=>{
    //   this.country_code=resp.countryCode;
    //   this.news.countryCode=resp.country_code;
    // },e=>{
    //  this.dataProvider.showToast(this.location_lang.location_error);
    //   console.log(e);
    // });
    this.geo.getMyLocation().then(resp=>{
      console.log(resp.countrycode);
      if(resp!=''){
        this.country_code=resp.countryCode;
          // this.news.countryCode=resp.country_code;
      }else{
        this.dataProvider.showToast(this.location_lang.location_error);
      }
    })
  }


  /**
   * Ionic navigation event will run when page is loaded
   */
  ionViewWillEnter() {
    this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
   console.log(this.userDetails);
    this.news.user_no=this.userDetails.details.user_no;
    this.news.user_type=this.userDetails.details.user_type;
    this.news.school_id=this.userDetails.details.school_id;

  }

  /**
   * Used to send the message
   */
   moveBack(){
     this.router.navigate(['tabs/messages']);
   }

  sendNews(){
    if(this.userDetails){
       if(this.news.news_description=='' || this.news.news_description.length>300){
        this.dataProvider.showToast(this.lang.max_body);
      }else{
        this.news.type=this.mediaType;
            this.fileUpload.uploadfile(this.media,this.news,'postNews',res=>{
              console.log('resPage',res);
              if(res){
                  this.router.navigate(['tabs/news']);
                  this.dataProvider.showToast(this.lang.news_posted);
                  this.news={
                    'title':'title',
                    'news_description':'',
                    'user_no':'',
                    'type':'',
                    'user_type':'',
                    'school_id':'',
                    'countryCode':''
                  }
                  this.media = '';
                  this.safeUrl=false;
              }else{
                this.dataProvider.showToast(this.lang.usnexpectedError);
              }
            });
          // this.uploadData(this.media,this.news);
          // this.startUpload(this.media,this.news);
      }
    }else{
      this.dataProvider.showToast(this.lang.user_not_exist);
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
            //this.openGallery()
            this.openCamera(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        }
      ]
    })
  await alert.present();
  }
  async takeVideo(){
  const alert=await this.alertCtrl.create({
      header: this.lang.video_option,
      buttons: [
        {
          text: this.lang.camera,
          handler: ()=>{
            this.openVideoCamera();
          }
        },
        {
          text: this.lang.gallery,
          handler: ()=>{
            this.openVideoGallery()
          }
        }
      ]
    })
  await alert.present();
  }

  openVideoCamera(){
    let options: CaptureVideoOptions = { limit: 1 };
    this.mediaCapture.captureVideo(options)
     .then((videodata)  => {
       console.log(videodata);
        this.media=videodata[0].fullPath;
        this.safeUrl=this.DomSanitizer.bypassSecurityTrustResourceUrl(this.media);
        this.mediaKey='video',
        this.mediaType='video/mp4'
     }).catch(error=>{
       console.log(error);
     })

  }
 async openVideoGallery(){
    let options: CameraOptions = {
      destinationType: this.camera.DestinationType.NATIVE_URI,
      mediaType: this.camera.MediaType.VIDEO,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    }
    this.dataProvider.showLoading();
    this.camera.getPicture(options).then(async(videoData)=>{
      this.dataProvider.hideLoading();
        if(videoData){
          console.log(videoData);
            var filename = videoData.substr(videoData.lastIndexOf('/') + 1);
            var dirpath = videoData.substr(0, videoData.lastIndexOf('/') + 1);

            dirpath = dirpath.includes("file://") ? dirpath : "file://" + dirpath;

            try {
              var dirUrl = await this.file.resolveDirectoryUrl(dirpath);
              var retrievedFile = await this.file.getFile(dirUrl, filename, {});
              console.log(dirUrl,retrievedFile);

            } catch(err) {

            }
            retrievedFile.file( data => {
                this.media = retrievedFile.nativeURL;
                this.safeUrl=this.DomSanitizer.bypassSecurityTrustResourceUrl(this.media);
                this.mediaKey='video',
                this.mediaType='video/mp4'
            })
        }
    }).catch(()=>this.dataProvider.hideLoading())
  }

  /**
   * mobile camera to take image
   */
  openCamera(type:any){
    let options: CameraOptions = {
       quality: 100,
      // destinationType: this.camera.DestinationType.NATIVE_URI,
      // //destinationType: this.camera.DestinationType.DATA_URL,
      // encodingType: this.camera.EncodingType.PNG,
      // mediaType: this.camera.MediaType.PICTURE,
      // allowEdit: true,
      // correctOrientation: true,
      sourceType: type
    }
    this.dataProvider.showLoading();
    this.camera.getPicture(options).then((imageData)=>{
      this.dataProvider.hideLoading();
      if(imageData){
        console.log('camera',imageData);
        this.media=imageData;
        this.safeUrl=this.DomSanitizer.bypassSecurityTrustResourceUrl(this.media);
        this.mediaKey='image',
        this.mediaType='image/png'
      }
    }).catch(()=>this.dataProvider.hideLoading())
  }


  ngOnInit() {
  }

//     startUpload(imgEntry,data) {
//       this.dataProvider.showLoading();
//     if(imgEntry){
//       this.file.resolveLocalFilesystemUrl(imgEntry).then(entry => {
//               ( < FileEntry > entry).file(file => this.readFile(file,data))
//           })
//           .catch(err => {
//               // this.presentToast('Error while reading file.');
//           });
//     }else{
//       this.uploadDataToServer(data);
//     }
// }
 
// readFile(file: any,data) {
//   console.log('file',file)
//     const reader = new FileReader();
//     reader.onload = () => {
//         const formData = new FormData();
//         const imgBlob = new Blob([reader.result], {
//             type: file.type
//         });
//         console.log('imgBlob',imgBlob,file.name);
//         this.uploadDataToServer(data,imgBlob,file.name)
//         // formData.append('file', imgBlob, file.name);
//         // this.uploadImageData(formData);
//     };
//     reader.readAsArrayBuffer(file);
// }


//   uploadDataToServer(data,imgBlob?:any,fileName?:any){
//     console.log(data,imgBlob,fileName);
//     Object.keys(data).map((key) => {
//         this.formdata.append(key, data[key]);
//     })
//     if(imgBlob){
//       this.formdata.append('file', imgBlob, fileName);
//     }
//     this.fileUpload.uploadByBlob(this.formdata);
    
//     // this.dataProvider.addNews(this.formdata,data.school_id).subscribe(res=>{
//     //   console.log(res);
//     //     this.dataProvider.hideLoading();
//     //         this.router.navigate(['tabs/news']);
//     //         this.dataProvider.showToast(this.lang.news_posted);
//     //         this.news={
//     //           'title':'title',
//     //           'news_description':'',
//     //           'user_no':'',
//     //           'type':'',
//     //           'user_type':'',
//     //           'school_id':'',
//     //           'countryCode':''
//     //         }
//     //         this.media = '';
//     //         this.safeUrl=false;
//     //     },e=>{
//     //       this.dataProvider.hideLoading();
//     //        this.dataProvider.showToast(this.lang.usnexpectedError);
//     //         this.dataProvider.showToast(this.lang.news_posted);
//     //         this.news={
//     //           'title':'title',
//     //           'news_description':'',
//     //           'user_no':'',
//     //           'type':'',
//     //           'user_type':'',
//     //           'school_id':'',
//     //           'countryCode':''
//     //         }
//     //         this.media = '';
//     //         this.safeUrl=false;
//     //        this.router.navigate(['tabs/news']);
//     //       console.log("Error",e);
//     //     })

//   }



//   uploadData(media,formData){
//         var url = environment.serverURL + 'postNews';
//         console.log('media',media);
//         console.log('formData',formData);
//         console.log('url',url);
//         var filename='';
//         if(media){
//           var name= media.substr(media.lastIndexOf('/') + 1);
//           var splitted = name.split('?');
//           filename=splitted[0];
//         }
//           this.news.type=this.mediaType;
//         var options: FileUploadOptions = {
//           fileName: filename,
//           fileKey: 'file',
//           mimeType: this.mediaType,
//           params: formData,
//         }
//         console.log('upload',options);
//         this.videoFileUpload = this.transfer.create();
//         this.dataProvider.showLoading();
//         this.videoFileUpload.upload(media, url, options).then((data) => {
//             console.log("Success",data);

//             this.dataProvider.hideLoading();
//             this.router.navigate(['tabs/news']);
//             this.dataProvider.showToast(this.lang.news_posted);
//             this.news={
//                 'title':'title',
//                 'news_description':'',
//                 'user_no':'',
//                 'type':'',
//                 'user_type':'',
//                 'school_id':'',
//                 'countryCode':''
//               }
//               this.media = '';
//               this.safeUrl=false;
//              // this.router.navigate(['tabs/news']);
//         })
//         .catch((err)=>{
//           this.dataProvider.hideLoading();
//           this.dataProvider.showToast(err);
//           console.log("Error",err);
//         });

//         // this.videoFileUpload.onProgress((data) => {
//         //   this.uploadPercent = Math.round((data.loaded/data.total) * 100);
//         // });
//   }//EOF uploadData





}
