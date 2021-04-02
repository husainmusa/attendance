import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicStorageModule } from '@ionic/storage';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { DateFormatPipe } from './pipes/date-format/date-format.pipe';
import { SafePipe } from './pipes/safe/safe.pipe';
import { SQLite } from '@ionic-native/sqlite/ngx';
// import { PhotoLibrary } from '@ionic-native/photo-library/ngx';
import {DataService} from './service/data/data.service';
import {AuthService} from './service/auth/auth.service';
import {DatabaseService} from './service/database/database.service';
import {LocationService} from './service/location/location.service';
import {StudentDataService} from './service/student-data/student-data.service';
import {SubscriptionService} from './service/subscription/subscription.service';
import {FileUploadService} from './service/file-upload/file-upload.service';
import {DocumentService} from './service/document/document.service';
import {GeoServiceProvider} from './service/geo-service/geo-service';
import { Network } from '@ionic-native/network/ngx';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
//import { Deeplinks } from '@ionic-native/deeplinks';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import{CreateClassPageModule} from './create-class/create-class.module';
import { ConnectNewMessagePageModule } from './connect-new-message/connect-new-message.module';
import { FCM } from '@ionic-native/fcm/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
//import { Geolocation } from '@ionic-native/geolocation/ngx';
import { LocationAccuracy } from '@ionic-native/location-accuracy/ngx';
//import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

import {LoaderComponent} from './components/loader/loader.component';
import {RateAppComponent} from './components/rate-app/rate-app.component';
import {SwitchAccountComponent} from './components/switch-account/switch-account.component';
import {EditStudentProfileComponent} from './components/edit-student-profile/edit-student-profile.component';
//import {EditCalssPageModule} from './common-modal/edit-calss/edit-calss.module';
// import {ViewClassNotesPageModule} from './common-modal/view-class-notes/view-class-notes.module';
 // import {SelectMessageUserPageModule} from './common-modal/select-message-user/select-message-user.module';

import { AppRate } from '@ionic-native/app-rate/ngx';

import { DocumentScanner, DocumentScannerOptions } from '@ionic-native/document-scanner/ngx';
// import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal/ngx';
// import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions } from '@ionic-native/media-capture/ngx';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File } from '@ionic-native/file/ngx';
import { IonicSelectableModule } from 'ionic-selectable';
import { Base64 } from '@ionic-native/base64/ngx';
import { FilePath } from '@ionic-native/file-path/ngx';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { InAppPurchase2 } from '@ionic-native/in-app-purchase-2/ngx';
import { Printer } from '@ionic-native/printer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}


@NgModule({
  declarations: [
        AppComponent,
        LoaderComponent,
        RateAppComponent,
        SwitchAccountComponent,
        EditStudentProfileComponent
        ],
  entryComponents: [
        LoaderComponent,
        RateAppComponent,
        SwitchAccountComponent,
        EditStudentProfileComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({mode:'md'}),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    CreateClassPageModule,
    ConnectNewMessagePageModule,
    IonicSelectableModule,
   // EditCalssPageModule,
   // ViewClassNotesPageModule,
   // SelectMessageUserPageModule,
    HttpClientModule, // <--- add this
    TranslateModule.forRoot({ // <--- add this
      loader: { // <--- add this
        provide: TranslateLoader, // <--- add this
        useFactory: (createTranslateLoader),  // <--- add this
        deps: [HttpClient] // <--- add this
      } // <--- add this
    }) // <--- add this
  ],
  providers: [
    StatusBar,
    SplashScreen,
    DataService,
    AuthService,
    DocumentService,
    LocationService,
    StudentDataService,
    SubscriptionService,
    SQLite,
    InAppPurchase2,
    // PhotoLibrary,
    DatabaseService,
    FileUploadService,
    Network,
    Deeplinks,
    ScreenOrientation,
    SocialSharing,
    InAppBrowser,
    Device,
    FCM,
    Camera,
    FileTransfer,
    Diagnostic,
    FileOpener,
    File,
    GeoServiceProvider,
    FilePath,
    MediaCapture,
    DocumentScanner,
    PhotoViewer,
    Base64,
    // PayPal,
    AndroidPermissions,
    // FileChooser,
  //  Geolocation,
    Printer,
    LocationAccuracy,
    //NativeGeocoder,
    AppRate,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
