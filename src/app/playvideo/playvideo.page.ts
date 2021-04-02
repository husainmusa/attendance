import { Component, OnInit,ViewChild,NgZone } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { NavController, NavParams, AlertController,IonContent, Platform,ModalController } from '@ionic/angular';
import { AuthService } from '../service/auth/auth.service';
import { DataService } from '../service/data/data.service';
import { TranslateService } from '@ngx-translate/core';
//import { TabsPage } from '../tabs/tabs';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { Network } from '@ionic-native/network/ngx';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import {Location} from '@angular/common'; 
declare var YT: any;
@Component({
  selector: 'app-playvideo',
  templateUrl: './playvideo.page.html',
  styleUrls: ['./playvideo.page.scss'],
})
export class PlayvideoPage implements OnInit {
  @ViewChild('videoPlayer') mVideoPlayer: any;
  @ViewChild('youTubeVideo') myouTubeVideo: any;

  /**
   * @member material contains the information about the currently playing material and related materials
   * @member flag Boolean variable will return true and false
   */
  material: any = {};
  flag: boolean = false;
  video: any;
  constructor(public navCtrl: NavController, 
			  //	public navParams: NavParams,
			    public dataProvider: DataService, 
//			    public sanitizer: DomSanitizer,
			    public platform: Platform, 
	              private route : ActivatedRoute,
              public socialSharing: SocialSharing,
	              private router:Router,
	              public zone:NgZone,
			    public screen: ScreenOrientation) {
  		this.route.queryParams.subscribe(params => {
	      if (this.router.getCurrentNavigation().extras.state) {
	     // 		 this.navData = this.router.getCurrentNavigation().extras.state.course;
            // console.log(this.navData);
		    this.dataProvider.showLoading();
		    let materialId = this.router.getCurrentNavigation().extras.state.materialId;
		    this.dataProvider.getMaterialDetails(materialId).then((materialDetail) => {
		      this.flag = true;
		      this.dataProvider.hideLoading();
		      if (materialDetail.material_video_link != '') {
		        materialDetail.material_video_link = materialDetail.material_video_link + '?enablejsapi=1'
		        this.youTubeVideoEvents();
		      }else{
		        this.VideoEvents()
		      }
		      this.material = materialDetail;
		    }).catch((err) => {
		      this.dataProvider.hideLoading();
		      this.dataProvider.errorALertMessage(err);
		    })
	      }
	    });
  }

  ionViewDidLoad() {
  }

  ionViewWillLeave() {
    if (this.platform.is("cordova")) {
      this.screen.lock(this.screen.ORIENTATIONS.PORTRAIT).then(() => {
      }).catch((err) => {
        console.log(err);
      })
    }
  }

  pausevideo() {
    //let video = this.mVideoPlayer.nativeElement; 
    //video.pause();
  }

  /**
   * Play video
   * @param materialId id of the selected ,aterial 
   */
  playvideo(materialId: any) {
    this.dataProvider.showLoading();
    this.dataProvider.getMaterialDetails(materialId).then((materialDetail) => {
      this.dataProvider.hideLoading();
      this.material = materialDetail;
    }).catch((err) => {
      this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(err);
    })
  }

  youTubeVideoEvents() {
    setTimeout(() => {
      this.video = new YT.Player(this.myouTubeVideo.nativeElement);
      this.video.addEventListener("onReady", () => {
        console.log("video is ready");
      });

      this.video.addEventListener("onStateChange", (event) => {
        switch (event.data) {
          case YT.PlayerState.UNSTARTED:
            if (this.platform.is("cordova")) {
              this.screen.unlock();
            }
            break;
          case YT.PlayerState.ENDED:
            if (this.platform.is("cordova")) {
              this.screen.lock(this.screen.ORIENTATIONS.PORTRAIT).then(()=>{
                console.log("locked again")
              })
            }
            break;
          case YT.PlayerState.PLAYING:
            console.log('playing');
            break;
        }
      });
    }, 2000)
  }

  VideoEvents() {
    setTimeout(() => {
      console.log("start")
      this.video = this.mVideoPlayer.nativeElement;
      this.video.addEventListener("loadeddata", () => {
        if (this.platform.is("cordova")) {
          this.screen.unlock();
        }
      });

      this.video.addEventListener("ended", () => {
        if (this.platform.is("cordova")) {
          this.screen.lock(this.screen.ORIENTATIONS.PORTRAIT).then(()=>{
            console.log("locked again")
          })
        }
      });
    }, 0)
  }

  share(video:any){
    //console.log(video);
    let content = video.material_description;
    if(this.platform.is('cordova')){
      if(video.material_video_file != ''){
        let videoUrl = video.material_video_file;
        this.socialSharing.share( content, video.material_title, videoUrl, null).then(res => {
          console.log(res);
        }, err => {
          console.log(err);
        })
      }else{
        let videoUrl = video.material_video_link;
        this.socialSharing.share(content, video.title, videoUrl, null).then((res)=>{
        }).catch((err)=>{
          console.log(err);
        }) 
      }
     }
  }

  ngOnInit() {
  }

}
