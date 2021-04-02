import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { DataService } from '../service/data/data.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.page.html',
  styleUrls: ['./contact-us.page.scss'],
})
export class ContactUsPage implements OnInit {

    user:any = {};

  /**
   * Constructor
   * @param dataProvider Use for interacting with the API
   */
  constructor(public dataProvider: DataService) {
  }

  /**
   * Send the query to backend
   * @param contactForm form from front end
   */
  submitContactusForm(contactForm:NgForm){
    this.dataProvider.showLoading();
    this.dataProvider.sendContact(this.user).then(()=>{
      this.dataProvider.hideLoading();
      contactForm.reset();
    }).catch((error)=>{
      this.dataProvider.hideLoading();
      this.dataProvider.errorALertMessage(error);
    })
  }

  ngOnInit() {
  }

}
