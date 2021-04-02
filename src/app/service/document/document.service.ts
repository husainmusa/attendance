import { Injectable } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx'
import{DataService} from '../data/data.service'

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  winRef;
  constructor(private iab: InAppBrowser) { }

  openPdf__OLD(path){
  	//use some really slow page for testing

	//if you have a spinner.html, you can load that instead of path here in inappbrowser, but make sure it works in all devices.

	var ref = this.iab.create(path, '_blank');

	//spinner html
	var spinner ="<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,height=device-height,initial-scale=1'><style>.loader {position: absolute;    margin-left: -2em;    left: 50%;    top: 50%;    margin-top: -2em;    border: 5px solid #f3f3f3;    border-radius: 50%;    border-top: 5px solid #3498db;    width: 50px;    height: 50px;    -webkit-animation: spin 1.5s linear infinite;    animation: spin 1.5s linear infinite;}@-webkit-keyframes spin {  0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); }}@keyframes spin {  0% { transform: rotate(0deg); }  100% { transform:rotate(360deg); }}</style></head><body><div class='loader'></div></body></html>";

	//intended webpage is loaded here (facebook)
	ref.executeScript({code: "(function() {document.write(\""+spinner+"\");window.location.href='"+path+"';})()"});
  }
  openPdf(url:string,isFile?:boolean){
  	console.log('calling openPdf :::',url);
  //	url="https://ionicframework.com/docs/native/in-app-browser";
  	if(isFile){
  		url = url+'.pdf';
  	}
    window.open(url, '_system');
 //  	this.winRef = (<any>window).open(url,'_blank','location=yes,hidden=no,enableViewportScale=yes,toolbar=no,hardwareback=yes');
 //  	// this.winRef.insertCSS({ code: ".loader {position: absolute;    margin-left: -2em;    left: 50%;    top: 50%;    margin-top: -2em;    border: 5px solid #f3f3f3;    border-radius: 50%;    border-top: 5px solid #3498db;    width: 50px;    height: 50px;    -webkit-animation: spin 1.5s linear infinite;    animation: spin 1.5s linear infinite;}@-webkit-keyframes spin {  0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); }}@keyframes spin {  0% { transform: rotate(0deg); }  100% { transform:rotate(360deg); }}" });
 //  	// this.winRef.executeScript({ code: "(function() {document.body.classList.add('loader');})()"});
 //  	let spinner ="<!DOCTYPE html><html><head><meta name='viewport' content='width=device-width,height=device-height,initial-scale=1'><style>.loader {position: absolute;    margin-left: -2em;    left: 50%;    top: 50%;    margin-top: -2em;    border: 5px solid #f3f3f3;    border-radius: 50%;    border-top: 5px solid #3498db;    width: 50px;    height: 50px;    -webkit-animation: spin 1.5s linear infinite;    animation: spin 1.5s linear infinite;}@-webkit-keyframes spin {  0% { -webkit-transform: rotate(0deg); } 100% { -webkit-transform: rotate(360deg); }}@keyframes spin {  0% { transform: rotate(0deg); }  100% { transform:rotate(360deg); }}</style></head><body><div class='loader'></div></body></html>";
	
	// //intended webpage is loaded here (facebook)
	// this.winRef.executeScript({code: "(function() {document.write(\""+spinner+"\");})()"});
 //  	this.winRef.addEventListener('loadstart', ()=>{
 //  	//	alert('calling load start');
 //  	}); 
 //    this.winRef.addEventListener('loadstop', ()=>{
 //    //	alert('calling load stop');
	// this.winRef.executeScript({code: "(function() {document.remove(\""+spinner+"\");window.location.href='"+url+"';})()"});
 //    	this.winRef.executeScript({ code: "(function() {document.body.classList.remove('loader');})()"});
 //    }); 
 //    this.winRef.addEventListener('loaderror', (e:any)=>{
 //    	alert('calling loaderror');
 //    }); 
    
  }
}

