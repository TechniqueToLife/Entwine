import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import { User } from '../model/user';
import { Product } from '../model/product';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { ShippingOption } from '../model/stripeshippingoption';

declare var Stripe: any; // : stripe.StripeStatic;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/x-www-form-urlencoded'
  })
};

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, AfterViewInit {

  productId! : string;
  product! : Product;
  bag : Product[] = [];
  inCart = false;

  databaseRef : AngularFirestore;

  selectedImageUrl = "";

  loadingImage = true;

  selectedVariationOption1? : string;
  selectedVariationOption2? : string;

  inStock = true;


  currentUser? : User;

  stripe: any;
  elements: any;
  expressCheckoutEnabled = false;


    total = 0;
    shippingTotal = 0;
    shipmentOption = "";
    noItems = false;
    validEmail = false;
    orderType = "physical";
    physicalItems = false;
    digitalItems = false;
    paymentMethod = "card";

    billingData : any = {
      firstName : "",
      lastName : "",
      address1 : "",
      address2 : "",
      city : "",
      zipCode : "",
      state : "",
      phoneNumber : ""
    };


    shippingOptionsData : {}[] = [];
    shippingOptions : ShippingOption[] = [];
    selectedShippingOption? : ShippingOption;

    @ViewChild('applePayButton') applePayButton: ElementRef | undefined;


  constructor(db: AngularFirestore, private router: Router,
      private route : ActivatedRoute, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private globals : Globals, private _snackBar: MatSnackBar, private http: HttpClient, private dialog : MatDialog) {
    this.productId = this.route.snapshot.params['id'];
    this.databaseRef = db;
  }

  ngOnInit(): void {
    this.route.url.subscribe(params => {
      this.productId = this.route.snapshot.params['id'];
      this.inCart = false;
      this.loadProduct();
    });

    this.login.bagObservable.subscribe(b => {
      this.inCart = false;
      this.bag = b;
      this.checkBagStatus();
    });

    this.login.currentUserObservable.subscribe(user => {
      if(user != undefined) {
        this.currentUser = user;
      }
    });
  }

  ngAfterViewInit(): void {
    this.stripe = Stripe('STRIPE_KEY');
    this.elements = this.stripe.elements();
  }

  loadProduct() {
    this.loadingImage = true;
    console.log(this.productId);
    this.userConnect.fetchProduct(this.productId).then(p => {
      this.product = p;
      this.selectedImageUrl = p.imageUrl!;
      this.total = p.price! * 100;

      if(p.variation1Name) {
        this.selectedVariationOption1 = p.variation1Options![0];
      }
      if(p.variation2Name) {
        this.selectedVariationOption2 = p.variation2Options![0];
      }

      if(!p.variation1Name && p.quantity == 0) {
        this.inStock = false;
      }

      this.orderType = p.digital ? "digital" : "physical";
      this.shippingTotal = 0;
      if(!p.digital) {
        //handle digital wallets after getting shipping options
        this.fetchShippingOptions();
      } else {
        //handle digital wallets now
        this.handleDigitalWallets();
      }

      this.updateSelectedOption();

      this.checkBagStatus();
    });
  }

  updateSelectedImage(u : string) {
    this.selectedImageUrl = u;
  }

  toggleInCart(product : Product) {
    if(!product.inCart) {
      this.product.cartId = this.productId;
      if(this.product.selectedVariation && this.product.selectedVariation.length > 0) {
        this.product.cartId = this.productId + ":" + this.product.selectedVariation;
      }
      let bagProduct = new Product({...this.product});
      console.log(bagProduct);
      this.bag.push(bagProduct);
      this.login.showCartPreview(bagProduct);
      // this.displayMessage(product.name + " added to cart", "Go to cart");
      this.checkBagStatus();
    } else {

    }
    this.login.updateBag(this.bag);

    if(this.login.currentUserId != undefined && this.login.currentUserId != "") {
      this.userConnect.addToCart(this.login.currentUserId, product.id!, 1, this.product.selectedVariation, this.product.cartId).then(res => {

      }).catch(e => {
        this.displayError("Connection error", "");
      })
    }
  }

  updateSelectedOption() {
    this.product.selectedVariation = this.selectedVariationOption1;
    if(this.selectedVariationOption2) {
      this.product.selectedVariation += "+" + this.selectedVariationOption2;
    }

    if(this.product.selectedVariation) {
      let varData = this.product.variationQuantities as any;

      this.inStock = varData[this.product.selectedVariation] != 0;
      console.log(varData[this.product.selectedVariation]);
    }

    this.checkBagStatus();
  }

  checkBagStatus() {
    console.log("\n\nCHECK BAG STATUS\n\n");

    console.log(this.bag);
    for(let p of this.bag) {
      console.log(p);
      if(p.id == this.productId && this.product.variation1Name == undefined) {
        //No variations, so only go by matching Ids
        this.inCart = true;
        this.product.inCart = true;
        break
      } else if(p.id == this.productId && p.selectedVariation != undefined && p.selectedVariation == this.product.selectedVariation) {
        this.inCart = true;
        this.product.inCart = true;
        console.log(p.selectedVariation + " tested var " + this.product.selectedVariation);
        break
      } else {
        this.inCart = false;
        this.product.inCart = false;
      }
    }
  }

  updateLoadStatus() {
    console.log("updateLoadStatus");
    this.loadingImage = false;
  }

  displayMessage(message: string, action: string) {
    let m = this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['primary-backgroundcolor']
    });

    m.onAction().subscribe(() => {
      // this.router.navigate(['/cart/'] , { skipLocationChange: false });
      this._snackBar.dismiss();
    });
  }

  displayError(message: string, action: string) {
    let m = this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['red-backgroundcolor']
    });

    m.onAction().subscribe(() => {
      this._snackBar.dismiss()
    });
  }




    //FOR PAYMENTS



    handleDigitalWallets() {
      console.log("handleDigitalWallets");
      let productIds = this.product.id + "%";

      const paymentRequest = this.stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: "Rome",
          amount: this.total + this.shippingTotal,
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: this.orderType == "physical" || this.orderType == "mixed",
        shippingOptions: this.shippingOptionsData
      });

      const prButton = this.elements.create('paymentRequestButton', {
        paymentRequest,
      });

      (async () => {
        // Check the availability of the Payment Request API first.
        const result = await paymentRequest.canMakePayment();
        if (result) {
          this.expressCheckoutEnabled = true;
          prButton.mount('#payment-request-button');
        } else {
          this.applePayButton!.nativeElement.style.display = 'none';
        }
      })();

      paymentRequest.on('shippingoptionchange', async (ev : any) => {
        console.log("shippingoptionchange");
        console.log(ev);
        console.log(ev["shippingOption"]["id"]);
        console.log(ev["shippingOption"]["amount"]);
        this.shipmentOption = ev["shippingOption"]["id"];
        this.shippingTotal = ev["shippingOption"]["amount"];

        ev.updateWith({status : "success", total: {
          amount: this.total + this.shippingTotal,
          label: 'Rome',
        }});
      });

      paymentRequest.on('token', async (ev : any) => {
        console.log(ev);
        this.paymentMethod = ev["methodName"];
        if(ev["shippingOption"]["amount"] != 0) {
          console.log("Shipping required");

          this.billingData.firstName = ev["shippingAddress"]["recipient"].split(" ")[0];


          if(ev["shippingAddress"]["recipient"].split(" ").length > 1) {
            this.billingData.lastName = ev["shippingAddress"]["recipient"].split(" ")[1];
          }

          this.billingData.address1 = ev["shippingAddress"]["addressLine"][0];
          if(ev["shippingAddress"]["addressLine"].length > 1) {
            this.billingData.address2 = ev["shippingAddress"]["addressLine"][1];
          }
          this.billingData.city = ev["shippingAddress"]["city"];
          this.billingData.zipCode = ev["shippingAddress"]["postalCode"];
          this.billingData.state = ev["shippingAddress"]["region"];
          this.billingData.country = ev["shippingAddress"]["country"];
        }

      });

        paymentRequest.on('paymentmethod', async (ev : any) => {
          let orderId = this.databaseRef.firestore.collection('purchaseHistory').doc().id;
          let chargeAmount = this.total + this.shippingTotal;
          this.http.post("https://STRIPESERVER/walletpaymentintent.php", "customerId="+this.currentUser!.stripeId+"&amount="+chargeAmount+"&description="+orderId+"&metadata="+productIds+"&receiptEmail="+ev["payerEmail"], httpOptions).subscribe(async (res : any)=> {
            console.log(res);
            console.log(ev);
            console.log(ev["payerEmail"]);
            console.log(ev["payerName"]);
            // Confirm the PaymentIntent without handling potential next actions (yet).
            const { paymentIntent, error: confirmError } = await this.stripe.confirmCardPayment(
              // @ts-ignore
              res["client_secret"],
              { payment_method: ev.paymentMethod.id },
              { handleActions: false }
            );

            if (confirmError) {
              // Report to the browser that the payment failed, prompting it to
              // re-show the payment interface, or show an error message and close
              // the payment interface.
              ev.complete('fail');

              this.displayMessage("Error accepting payment", "Dismiss");
            } else {
              // Report to the browser that the confirmation was successful, prompting
              // it to close the browser payment method collection interface.
              // Check if the PaymentIntent requires any actions and, if so, let Stripe.js
              // handle the flow. If using an API version older than "2019-02-11"
              // instead check for: `paymentIntent.status === "requires_source_action"`.



                for(let item of [this.product]) {
                  this.databaseRef.firestore.collection('product').doc(item.id).get().then(s => {
                    let data = s.data();

                    if(item.selectedVariation != undefined) {
                        let varData = item.variationQuantities as any;
                        s.ref.update({[`variationQuantities.${item.selectedVariation}`] : varData[item.selectedVariation] - item.cartQuantity!, quantity : data!["quantity"] - item.cartQuantity!, purchaseCount : data!["purchaseCount"] + item.cartQuantity!})
                    } else {
                      s.ref.update({quantity : data!["quantity"] - item.cartQuantity!, purchaseCount : data!["purchaseCount"] + item.cartQuantity!})
                    }

                  })
                }

                this.userConnect.addToPurchaseHistory(ev["payerEmail"], this.total, res["id"], "$", [this.product], orderId, ev["payerName"].split(" ")[0], ev["payerName"].split(" ")[1], this.orderType, this.currentUser?.userId, this.billingData, this.shipmentOption, this.paymentMethod, this.shippingTotal).then(purchaseId => {
                  if(this.currentUser != undefined) {
                    this.userConnect.clearCart(this.currentUser!.userId!).then(res => {
                      ev.complete('success');

                      this.login.updateBag([]);
                      this.login.updatePurchaseId(purchaseId);
                      this.router.navigate(["paymentcomplete"] , { skipLocationChange: false });
                    }).catch(e => {
                      this.displayMessage("Connection Error", "Dismiss");
                    })

                  } else {
                    this.login.updateBag([]);
                    this.login.updatePurchaseId(purchaseId);
                    this.router.navigate(["/paymentcomplete/" + purchaseId] , { skipLocationChange: false });
                  }

                }).catch(e => {
                  this.displayMessage("Connection Error", "Dismiss");
                  // this.router.navigate(["/paymentcomplete/" + res["latest_invoice"]] , { skipLocationChange: false });
                });




              if (paymentIntent.status === "requires_action") {
                // Let Stripe.js handle the rest of the payment flow.
                // @ts-ignore
                const { error } = await stripe.confirmCardPayment(res["client_secret"]);
                if (error) {
                  this.displayMessage("Error accepting payment", "Dismiss");
                  // The payment failed -- ask your customer for a new payment method.
                } else {
                  // The payment has succeeded.
                  console.log("PAYMENT COMPLETED");
                }
              } else {
                // The payment has succeeded.
                console.log("PAYMENT COMPLETED");
              }
            }
          });
        });
    }


  fetchShippingOptions() {
    this.userConnect.fetchShippingOptions().then(s => {
      this.shippingOptions = s;


      this.shippingOptions.sort(function(a, b){return a.amount - b.amount});
      if(this.shippingOptions.length > 0) {
        console.log("this.shippingOptions.length");
        this.shippingTotal = this.shippingOptions[0].amount;
        this.shipmentOption = this.shippingOptions[0].id;
        console.log(this.shippingTotal);
        this.selectedShippingOption = this.shippingOptions[0];
      }
      for(let option of this.shippingOptions) {
        this.shippingOptionsData.push(option.data);
      }

      this.handleDigitalWallets();

    })
  }


  updateSelectedShippingOption() {
    this.shippingTotal = this.selectedShippingOption!.amount;
    console.log(this.selectedShippingOption);
  }


}
