import { Injectable } from '@angular/core';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { File, FileEntry } from '@ionic-native/file/ngx';
import { environment } from '../../../environments/environment';
import { HttpClient,HttpRequest,HttpEventType, HttpHeaders, HttpErrorResponse, HttpParams} from '@angular/common/http';
import { DataService } from '../data/data.service';
import { tap, map,last } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

const env = environment;
@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  public uploadProgress: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  constructor(public httpClient: HttpClient,
  			  public http: HttpClient,
              private file:File,
              public dataProvider: DataService,
              private transfer: FileTransfer) {
  				this.dataProvider.language.subscribe(res=>{
			      console.log('res>>>>',res);
			      environment.lang_code=res;
			    })

               }




	async uploadfile(imagePath,data,endPoint,callBack:any) {
		this.dataProvider.showLoading();
	  	const formData = new FormData();
		if(imagePath){
	  		const imageFile:any = await this.getSingleFile(imagePath);
	  		formData.append('file', imageFile, imageFile.name);
		}
		  Object.keys(data).map((key) => {
	        formData.append(key, data[key]);
	      })
	  
	  	let header = new HttpHeaders();
		formData.append('lang_code', environment.lang_code);
		header.append('Content-Type', 'application/json');

		this.http.post(environment.serverURL + endPoint, formData).subscribe((response: any) => {
			this.dataProvider.hideLoading();
			if(response){
			  if (response['_body'] != '') {
			    let resObj = response;
			    callBack(response);
			  } else {
			    callBack(false);
			  }
			}
		}, (error) => {
			this.dataProvider.hideLoading();
			callBack(false);
		})
	}







	async getSingleFile(filePath: string): Promise<File> {
	  // Get FileEntry from image path
	  const fileEntry: FileEntry = await this.file.resolveLocalFilesystemUrl(filePath) as FileEntry;

	  // Get File from FileEntry. Again note that this file does not contain the actual file data yet.
	  const cordovaFile: any = await this.convertFileEntryToCordovaFile(fileEntry);
	  console.log('cordovaFile',cordovaFile);
	  // Use FileReader on the File object to populate it with the true file contents.
	  return this.convertCordovaFileToJavascriptFile(cordovaFile);
	}

	private convertFileEntryToCordovaFile(fileEntry: FileEntry): Promise<any> {
	  return new Promise<any>((resolve, reject) => {
	    fileEntry.file(resolve, reject);
	  })
	}

	private convertCordovaFileToJavascriptFile(cordovaFile: any): Promise<File> {
	  return new Promise<File>((resolve, reject) => {
	    const reader = new FileReader();
	    reader.onloadend = () => {
	      if (reader.error) {
	        reject(reader.error);
	      } else {
	        const blob: any = new Blob([reader.result], { type: cordovaFile.type });
	        blob.lastModifiedDate = new Date();
	        blob.name = cordovaFile.name;
	        console.log('blob',blob);
	        resolve(blob as File);
	      }
	    };
	    reader.readAsArrayBuffer(cordovaFile);
	  });
	}










	uploadByTransfer(media,formData,endPoint,callBack:any){
		this.dataProvider.showLoading();
			const today = new Date();
			if(media){
				const readyToUpload= async (file:any)=>{
					const localURL = file && file.localURL ? file.localURL : '';
					let fileName = ""; 
			        let tmpFile = localURL.substr(localURL.lastIndexOf('/') + 1);
			        if(tmpFile){
			        	const splitted = tmpFile.split('?');
		          		fileName=splitted[0] || "" ;
			        }

			        if(fileName=="")fileName=file && file.lastModified ? file.lastModified : 'CDW-'+today.getTime();

			        let options: FileUploadOptions = {	          
			          fileKey: 'file',
			          fileName: fileName,
			          mimeType: "multipart/form-data",
			          params: formData,
			          chunkedMode:false,
			          headers:{
			          	Connection: "close"
			          }
			        };
			        console.log('upload',options);
		        	const transfer = this.transfer.create();
		        	transfer.upload(media, environment.serverURL + endPoint, options).then((transferResponse:any)=>{
		        		console.log('transferResponse',transferResponse);
		        		this.dataProvider.hideLoading();
		        		callBack(transferResponse);
		        	},(e:any)=>{
		        		console.log('transferResponse ERROR',e);
		        		this.dataProvider.hideLoading();
		        		callBack(false);
		        	});

		        	
				}
				this.file.resolveLocalFilesystemUrl(media).then(entry => {
		              ( < FileEntry > entry).file(file => readyToUpload(file))
		         })
		         .catch(err => {
		         	this.dataProvider.hideLoading();
		              // this.presentToast('Error while reading file.');
		              console.log('resolveLocalFilesystemUrl CATCH ERROR:::',err);
		              callBack(false);
		         });
			}else{
				let header = new HttpHeaders();
		          formData.lang_code = environment.lang_code;
		          header.append('Content-Type', 'application/json');
		          this.http.post(environment.serverURL + endPoint, formData,{headers:header}).subscribe((response: any) => {
	        		this.dataProvider.hideLoading();
		            if(response){
		              if (response['_body'] != '') {
		                let resObj = response;
		                callBack(response);
		              } else {
		                callBack(false);
		              }
		            }
		          }, (error) => {
	        		this.dataProvider.hideLoading();
		            callBack(false);
		          })
			}
	        


        	
	}






  upload____OLD(media,formData,endPoint,callBack:any){
  	this.dataProvider.showLoading();
		const readyToUpload= async (file:any)=>{
			const today = new Date();
			const localURL = file && file.localURL ? file.localURL : '';
			let fileName = ""; 
	        let tmpFile = localURL.substr(localURL.lastIndexOf('/') + 1);
	        if(tmpFile){
	        	const splitted = tmpFile.split('?');
          		fileName=splitted[0] || "" ;
	        }

	        if(fileName=="")fileName=file && file.lastModified ? file.lastModified : 'CDW-'+today.getTime();

	        let options: FileUploadOptions = {	          
	          fileKey: 'file',
	          fileName: fileName,
	          mimeType: formData.type,
	          params: formData,
	          chunkedMode:false
	        };
	        console.log('upload',options);
        	const transfer = this.transfer.create();
        	transfer.upload(media, encodeURI(environment.serverURL + endPoint), options).then((transferResponse:any)=>{
        		console.log('transferResponse',transferResponse);
        		this.dataProvider.hideLoading();
        		callBack(transferResponse);
        	},(e:any)=>{
        		console.log('transferResponse ERROR',e);
        		this.dataProvider.hideLoading();
        		callBack(false);
        	});

        	
		}
		this.file.resolveLocalFilesystemUrl(media).then(entry => {
              ( < FileEntry > entry).file(file => readyToUpload(file))
         })
         .catch(err => {
         	this.dataProvider.hideLoading();
              // this.presentToast('Error while reading file.');
              console.log('resolveLocalFilesystemUrl CATCH ERROR:::',err);
              callBack(false);
         });
  }
    uploadByBlob(data){
  	console.log(data);

  }
}
