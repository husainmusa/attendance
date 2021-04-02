import { Component, OnInit, Input,NgZone } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-rate-app',
  templateUrl: './rate-app.component.html',
  styleUrls: ['./rate-app.component.scss'],
})
export class RateAppComponent implements OnInit {
 @Input()lang;
 @Input()data;
 noteDescription:any;
  providedStars:any;
  constructor(public popoverController: PopoverController) { 
  }

  ngOnInit() {

  	console.log(this.lang,this.data);
    setTimeout(()=>{

        const inputElement = document.getElementById("textArea") as HTMLInputElement;
        inputElement.value=this.data.note;
        if(this.data.rating=='1'){
         let ch:any=document.getElementById('rating-1');
         console.log(ch);
         setTimeout(()=>{
           ch.checked=true;
         },300)
        }
        if(this.data.rating=='2'){
         let ch:any=document.getElementById('rating-2');
         console.log(ch);
         setTimeout(()=>{
           ch.checked=true;
         },300)
        }
        if(this.data.rating=='3'){
         let ch:any=document.getElementById('rating-3');
         console.log(ch);
         setTimeout(()=>{
           ch.checked=true;
         },300)
        }
        if(this.data.rating=='4'){
         let ch:any=document.getElementById('rating-4');
         console.log(ch);
         setTimeout(()=>{
           ch.checked=true;
         },300)
        }
        if(this.data.rating=='5'){
         let ch:any=document.getElementById('rating-5');
         console.log(ch);
         setTimeout(()=>{
           ch.checked=true;
         },300)
        }
    },500)

  }

  closePopup(data){
  	this.popoverController.dismiss(data)
  }
  rate(){
    const inputElement = document.getElementById("textArea") as HTMLInputElement;
    let i=inputElement.value;
    let stars:any;
    if(this.providedStars){
      stars=this.providedStars;
    }else{
      stars=this.data.rating;
    }
    let data={
      stars:stars,
      description:i
    }
  	// console.log(data);
  	this.closePopup(data);
  }

  provideRating(stars,eve){
    console.log(eve);
  	this.providedStars=stars;
  }


}
