import { Injectable,NgZone } from '@angular/core';
// import { PayPal, PayPalPayment, PayPalConfiguration } from '@ionic-native/paypal/ngx';
import {DataService} from '../data/data.service';
import { environment } from '../../../environments/environment';
import {IAPProduct, InAppPurchase2} from "@ionic-native/in-app-purchase-2/ngx";
import {AlertController, LoadingController, Platform, ToastController} from "@ionic/angular";
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { Storage } from '@ionic/storage';

const env = environment;

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
    productMothly: any;
    productYearly: any;
    productStatus:any;
    isExpired:any;
    isPurchased:any=[];
    userDetails:any;
    paymentDone=false;
	constructor(
        // private payPal: PayPal,
				private dataService:DataService,
				private iap2: InAppPurchase2,
				private platform: Platform,
				private loadingCtrl: LoadingController,
				private toastCtrl: ToastController,
				private alertCtrl: AlertController,
        private route : ActivatedRoute,
        private storage: Storage,
        private router:Router,
        public zone:NgZone) {
            this.platform.ready().then(() => {
              this.setup();
            })
            if (localStorage.getItem("userloggedin")) {
              this.userDetails = JSON.parse(localStorage.getItem("userloggedin"));
            }
        }


    public products = [
            {
                id:'com.monthlysubscribe.com',
                price:'1.99',
                billingPeriod:1,
                billingPeriodUnit:'month',
                appleProductId:'',
                googleProductId:'com.monthlysubscribe.com',
                type: this.iap2.CONSUMABLE,
            },
            {
                id:'com.yearlysubscription.com',
                price:'19.95',
                billingPeriod:1,
                billingPeriodUnit:'year',
                appleProductId:'',
                googleProductId:'com.yearlysubscription.com',
                type: this.iap2.CONSUMABLE
            }
    ];
    public products_ios = [
            {
                id:'apple.monthlySubscription',
                price:'1.99',
                billingPeriod:1,
                billingPeriodUnit:'month',
                appleProductId:'apple.monthlySubscription',
                googleProductId:'com.monthlysubscribe.com',
                type: this.iap2.CONSUMABLE,
            },
            {
                id:'apple.yearlySubscription.com',
                price:'19.99',
                billingPeriod:1,
                billingPeriodUnit:'year',
                appleProductId:'apple.yearlySubscription.com',
                googleProductId:'com.yearlysubscription.com',
                type: this.iap2.CONSUMABLE
            }
    ];


 setup() {
     console.log('callSetup');
    this.iap2.verbosity = this.iap2.DEBUG;
    if (this.platform.is('ios')) {
      this.iap2.register(this.products_ios);
    } else if (this.platform.is('android')) {
      this.iap2.register(this.products);
    }
    this.iap2.refresh();
  }

  checkout(p) {
      this.dataService.showLoading();
      let productId;
      let pData={};
        if (this.platform.is('ios')) {
                productId = this.products_ios[p].appleProductId;
                pData={
                      id:this.products_ios[p].id,
                      price:this.products_ios[p].price,
                      billingPeriod:this.products_ios[p].billingPeriod,
                      billingPeriodUnit:this.products_ios[p].billingPeriodUnit
                }
            } else if (this.platform.is('android')) {
                productId = this.products[p].googleProductId;
                pData={
                    id:this.products[p].id,
                    price:this.products[p].price,
                    billingPeriod:this.products[p].billingPeriod,
                    billingPeriodUnit:this.products[p].billingPeriodUnit
                }
            }
           console.log('productId',productId);
    this.registerHandlersForPurchase(productId,pData);
    try {
      let product = this.iap2.get(productId);
      console.log('Product Info: ' ,product);
      this.iap2.order(productId).then((p) => {
          this.dataService.hideLoading();
        console.log('Purchase Succesful' + JSON.stringify(p));
      }).catch((e) => {
          // this.dataService.showToast('Error Ordering From Store')
          this.dataService.hideLoading();
        console.log('Error Ordering From Store' + e);
      });
    } catch (err) {
        // this.dataService.showToast('Error Ordering From Store')
        this.dataService.hideLoading();
        console.log('Error Ordering ' + JSON.stringify(err));
    }
  }
  registerHandlersForPurchase(productId,pData) {
    let self = this.iap2;
    console.log('self::::',self);
    this.iap2.when(productId).updated(function (product: IAPProduct) {
      if (product.loaded && product.valid && product.state === self.APPROVED && product.transaction != null) {
          console.log('updated',product);
          product.finish();
      }
    });
    this.iap2.when(productId).owned((product: IAPProduct) => {
      product.finish();
    });
    this.iap2.when(productId).approved((product: IAPProduct) => {
      product.finish();
      console.log('approved',product);
      if(this.platform.is('android')){
        this.subcribeToServer(product,pData);
      }else{
        this.purchaseToServer(product,pData);
      }
    });
    this.iap2.when(productId).refunded((product: IAPProduct) => {
    });
    this.iap2.when(productId).expired((product: IAPProduct) => {
    });
  }

  subcribeToServer(subs,pData){
       let receipt =JSON.parse(subs.transaction.receipt);
          let data={
              plan_id: pData.id,
              iap_id:receipt.orderId,
              paymentType:subs.transaction.type,
              billingPeriod:pData.billingPeriod,
              billingPeriodUnit:pData.billingPeriodUnit,
              ammount:pData.price,
              user_id:this.userDetails.details.user_no,
              school:this.userDetails.details.school_id
          }
          this.dataService.subscribePlan(data).then(res=>{
              this.paymentDone=true;
              this.storage.get('currentStudent').then((data) => {
                  this.iap2.refresh();
                  this.dataService.showToast('Plan subscribed Successfully');
                  const navigation: NavigationExtras = {
                    state : data
                  };
                  this.zone.run(() => {
                    this.router.navigate(['student-detail'], navigation);
                  });
              });

          },e=>{
              this.dataService.showToast('Error in processing payment');
          })

  }
    purchaseToServer(subs,pData){
        let receipt =JSON.parse(subs.transaction.receipt);
          let data={
              plan_id: pData.id,
              iap_id:receipt.orderId,
              paymentType:subs.transaction.type,
              billingPeriod:pData.billingPeriod,
              billingPeriodUnit:pData.billingPeriodUnit,
              ammount:pData.price,
              user_id:this.userDetails.details.user_no,
              school:this.userDetails.details.school_id
          }
          this.dataService.purchase(data).then(res=>{
              this.paymentDone=true;
              this.storage.get('currentStudent').then((data) => {
                  this.iap2.refresh();
                  const navigation: NavigationExtras = {
                  state : data
                  };
                  this.zone.run(() => {
                    this.router.navigate(['student-detail'], navigation);
                  });
              });

          },e=>{
              this.dataService.showToast('Error in processing payment');
          })

  }


  paymentStatus(pid?,callback?){
    let productId;
    if (this.platform.is('ios')) {
      productId = this.products_ios[pid].appleProductId;
      this.iap2.when(productId).approved(p => p.verify()).verified(p => p.finish());
    } else if (this.platform.is('android')) {
      productId = this.products[pid].googleProductId;
    }
    
    this.iap2.refresh();
    callback(true);
  }












  doPaypalPayment(data:any): Promise<any> {
    return new Promise((resolve, reject) => {
			   resolve('true');
			  })
	}
}
