import { Component, OnInit } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.page.html',
  styleUrls: ['./about-us.page.scss'],
})
export class AboutUsPage implements OnInit {

    constructor(public iap: InAppBrowser) {
  }

  /**
   * Used to open the weblink
   * @param url 
   */
  openUrl(url){
    const browser = this.iap.create(url, '_blank');
    browser.show();
  }

  openPDF(url: string) {
    window.open(url, '_system');
    //browser.show();
  }

  ngOnInit() {
  }

}
 