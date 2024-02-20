import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import * as firebase from 'firebase/app';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/compat/auth';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from '../model/user';
import { Product } from '../model/product';
import { Purchase } from '../model/purchase';
import { ShippingOption } from '../model/stripeshippingoption';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Card } from '../model/card';
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';

declare var Stripe: any; // : stripe.StripeStatic;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/x-www-form-urlencoded'
  })
};

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  @ViewChild('cardInfo') cardInfo: ElementRef | undefined;
  @ViewChild('applePayButton') applePayButton: ElementRef | undefined;

  card: any;
  cardHandler = this.onChange.bind(this);
  cardError: string | undefined;

  stripe: any;
  elements: any;

  email = new FormControl('', [Validators.required, Validators.email]);
  emailText = "";
  cards : Card[] = [];

  selectedCard : string | undefined;

  items : Product[] = [];

  priceIds : string[] = [];
  productIds : string[] = [];
  //Any array that'll be popped for price ids
  tempPriceIds : string[] = [];
  tempProductIds : string[] = [];

  selectedShippingOption? : ShippingOption;

  total = 0;
  shippingTotal = 0;
  shipmentOption = "";
  noItems = false;
  validEmail = false;
  orderType = "physical";
  physicalItems = false;
  digitalItems = false;
  paymentMethod = "card";

  expressCheckoutEnabled = false;

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

  states : string[] = [];

  inputWidth = 550;

  saveCard = false;

  checkoutInProgress = false;

  submitEnabled = false;

  paymentMethodsLoaded = false;
  itemsLoaded = false;


  currentUser? : User;
  databaseRef : AngularFirestore;

  shippingOptionsData : {}[] = [];
  shippingOptions : ShippingOption[] = [];


  constructor(public auth: AngularFireAuth, firestore: AngularFirestore, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private router : Router, private http: HttpClient, private cd: ChangeDetectorRef, private globals : Globals, private _snackBar: MatSnackBar, private dialog : MatDialog, db: AngularFirestore) {
      this.databaseRef = firestore;
      this.login.updateInAdmin(false);

      this.states = this.globals.states;
      this.billingData.state = this.states[0];
      this.databaseRef = db;

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
      })
    }


    ngOnInit(): void {
      this.login.currentUserObservable.subscribe(user => {
        if(user != undefined) {
          this.currentUser = user;
          this.emailText = user.email!;
          this.billingData.firstName = user.firstName;
          this.billingData.lastName = user.lastName;
          this.validEmail = true;
          this.fetchCards();
        }
      });

      this.auth.authState.subscribe((returnedUser) => {

        this.items = [];
        this.total = 0;

        this.priceIds = [];
        this.tempPriceIds = [];

        this.productIds = [];
        this.tempProductIds = [];

        if(returnedUser && returnedUser.uid) {
          console.log("user id");

          this.userConnect.fetchBag(returnedUser.uid).then(items => {
            for(let item of items) {
              console.log(items.length + " items");
              this.userConnect.fetchProduct(item.id!).then(p => {


                p.cartQuantity = item.cartQuantity!;
                p.selectedVariation = item.selectedVariation;
                p.cartId = item.cartId;
                console.log(p);

                this.items.push(p);
                this.priceIds.push(p.priceId!);
                this.tempPriceIds.push(p.priceId!);

                this.productIds.push(p.stripeProductId!);
                this.tempProductIds.push(p.stripeProductId!);

                if(p.digital) {
                  this.digitalItems = true;
                } else {
                  this.physicalItems = true;
                }

                item = p;
                console.log(items.length + " items " + this.priceIds.length + " ids");

                if(this.priceIds.length == items.length) {
                  console.log(items.length + " items " + this.priceIds.length + " ids");

                  this.fetchItems(this.tempPriceIds.pop());
                }


              });

          }
        })
      } else {
        console.log("no user id");
          this.login.bagObservable.subscribe(b => {
            let bag = b;

            for(let product of b) {
              this.userConnect.fetchProduct(product.id!).then(p => {
                p.cartQuantity = product.cartQuantity!;
                p.selectedVariation = product.selectedVariation;
                p.cartId = product.cartId;
                console.log(p);
                this.items.push(p);

                this.priceIds.push(p.priceId!);
                this.tempPriceIds.push(p.priceId!);

                this.productIds.push(p.stripeProductId!);
                this.tempProductIds.push(p.stripeProductId!);

                if(p.digital) {
                  this.digitalItems = true;
                } else {
                  this.physicalItems = true;
                }

                if(b.length == this.items.length) {
                  this.fetchItems(this.tempPriceIds.pop());
                }
              })
            }
          })
        }
      })
    }

    fetchCards() {
      if(this.currentUser!.userId == undefined) {
        this.paymentMethodsLoaded = true;
        this.selectedCard = "newCard";

        return;
      }

      this.paymentMethodsLoaded = false;
      console.log(this.currentUser);
      if(this.currentUser!.stripeId) {
        this.http.post("https://STRIPESERVER/fetchpaymentmethods.php", "customerId="+this.currentUser!.stripeId, httpOptions).subscribe((res : any) => {
          this.paymentMethodsLoaded = true;
          console.log('post result %o', res);

          for(let c of res["data"]) {
            this.cards.push(new Card(c))
          }

          if(this.cards.length == 0) {
            this.selectedCard = "newCard";
          } else {

            this.selectedCard = this.cards[0].id;
          }
        });
      }
    }

    fetchItems(id? : string) {
      console.log("Fetch item " + id);

      if(!id || id == undefined) {
        if(this.physicalItems && !this.digitalItems) {
          this.orderType = "physical";
          this.fetchShippingOptions();
        } else if(this.physicalItems && this.digitalItems) {
          this.orderType = "mixed";
          this.fetchShippingOptions();
        } else if(!this.physicalItems && this.digitalItems) {
          this.orderType = "digital";
          this.shippingTotal = 0;
        }

        this.fetchAdditionalProductData();
        return;
      }

      console.log(id);
      this.itemsLoaded = false;
      let items = this.items.filter(i => i.priceId == id);
        this.http.post("https://STRIPESERVER/retrieveprice.php", "id=" + id, httpOptions).subscribe((res : any) => {
          console.log(res);
          console.log(res["unit_amount"]);
          for(let item of items) {
            console.log(item);
            item.price = Number(res["unit_amount"]);
            item.currency = res["currency"];
          }


          this.fetchItems(this.tempPriceIds.pop());
          });


    }

    //since stripe splits some of the data we need into two different data models, fetch both first
    fetchAdditionalProductData() {
      console.log(this.items);
      console.log(this.items.length);
      if(this.items.length == 0) {
        this.itemsLoaded = true;
        this.noItems = true;
        return
      }
      for(let item of this.items) {
        this.total += item.price! * item.cartQuantity!;

        console.log(item);

        this.http.post("https://STRIPESERVER/retrieveproduct.php", "id=" + item.stripeProductId, httpOptions).subscribe((productData : any) => {
          console.log('product result %o', productData);
          // item.description = productData["description"];
          item.name = productData["name"];
          console.log(item);
          // item.imageUrl = productData["imageUrl"];
          console.log(item.imageUrl);
          if(item.id == this.items[this.items.length - 1].id) {
            this.itemsLoaded = true;
            console.log(this.total);
            this.handleDigitalWallets();
          }
        });
      }
    }


    ngAfterViewInit() {
      this.stripe = Stripe('STRIPE_KEY');
      this.elements = this.stripe.elements();
      this.initiateCardElement();
    }

    initiateCardElement() {

      // Giving a base style here, but most of the style is in scss file
      const cardStyle = {
        base: {
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      };
      this.card = this.elements.create('card', {cardStyle});
      this.card.mount(this.cardInfo!.nativeElement);
      this.card.addEventListener('change', this.cardHandler);

    }

    handleDigitalWallets() {

      let productIds = "";
      for(let p of this.items) {
        productIds += p.id + "%";
      }

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



                for(let item of this.items) {
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

                this.userConnect.addToPurchaseHistory(ev["payerEmail"], this.total, res["id"], "$", this.items, orderId, ev["payerName"].split(" ")[0], ev["payerName"].split(" ")[1], this.orderType, this.currentUser?.userId, this.billingData, this.shipmentOption, this.paymentMethod, this.shippingTotal).then(purchaseId => {
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

    onChange({error} : any) {
      if (error) {
          this.cardError = error.message;
      } else {
          this.cardError = undefined;
      }
      this.cd.detectChanges();
    }

    finalizePayment() {
      this.chargeItems();
    }

    chargeItems() {
      console.log(this.selectedCard);
      console.log(this.priceIds[0]);
      let productIds = "";
      for(let p of this.items) {
        productIds += p.id + "%";
      }

      let orderId = this.databaseRef.firestore.collection('purchaseHistory').doc().id;
      let chargeAmount = this.total + this.shippingTotal;
      console.log(chargeAmount);
      this.http.post("https://STRIPESERVER/paymentintent.php", "customerId="+this.currentUser!.stripeId+"&amount="+chargeAmount+"&paymentMethod="+this.selectedCard+"&description="+orderId+"&metadata="+productIds+"&receiptEmail="+this.emailText, httpOptions).subscribe((res : any)=> {
        console.log(this.total + this.shippingTotal);
        console.log(this.total);
        console.log('post result %o', res);
        if(res["status"] == "succeeded") {
          for(let item of this.items) {
            this.databaseRef.firestore.collection('product').doc(item.id).get().then(s => {
              let data = s.data();
              console.log(item);
              console.log(data!["purchaseCount"] );

              if(item.selectedVariation != undefined) {
                  let varData = item.variationQuantities as any;

                  console.log(varData[item.selectedVariation]);
                  console.log(varData);
                  console.log(item.cartQuantity);

                  s.ref.update({[`variationQuantities.${item.selectedVariation}`] : varData[item.selectedVariation] - item.cartQuantity!, quantity : data!["quantity"] - item.cartQuantity!, purchaseCount : data!["purchaseCount"] + item.cartQuantity!})
              } else {
                s.ref.update({quantity : data!["quantity"] - item.cartQuantity!, purchaseCount : data!["purchaseCount"] + item.cartQuantity!})
              }
            })
          }

          this.userConnect.addToPurchaseHistory(this.emailText, this.total, res["id"], "$", this.items, orderId, this.billingData.firstName, this.billingData.lastName, this.orderType, this.currentUser?.userId, this.billingData, this.shipmentOption, this.paymentMethod, this.shippingTotal).then(purchaseId => {
            if(this.currentUser != undefined) {
              this.userConnect.clearCart(this.currentUser!.userId!).then(res => {
                this.login.updateBag([]);
                this.login.updatePurchaseId(purchaseId);
                this.router.navigate(["paymentcomplete"] , { skipLocationChange: false });
              }).catch(e => {
                this.displayMessage("Connection Error", "Dismiss");
              })

            } else {
              this.login.updateBag([]);
              this.router.navigate(["/paymentcomplete/" + purchaseId] , { skipLocationChange: false });
            }

          }).catch(e => {
            this.displayMessage("Connection Error", "Dismiss");
            // this.router.navigate(["/paymentcomplete/" + res["latest_invoice"]] , { skipLocationChange: false });
          });
        } else {
          this.displayErrorMessage("Payment Error", "Dismiss");
        }
      });

    }

    updateSelectedShippingOption() {
      this.shippingTotal = this.selectedShippingOption!.amount;
      console.log(this.selectedShippingOption);
    }

    async createPaymentMethod() : Promise<boolean> {

      let stateInput = this.billingData.state.split("-")[0].trim();
      console.log(stateInput);

      const {paymentMethod, error} = await this.stripe.createPaymentMethod({
        type: 'card',
        card: this.card,
        billing_details: {
          name : this.billingData.firstName + " " + this.billingData.lastName, address : {
            city : this.billingData.city,
            country : "US",
            line1 : this.billingData.address1,
            line2 : this.billingData.address2,
            postal_code : this.billingData.zipCode,
            state : stateInput
          },
          phone : "+1" + this.billingData.phoneNumber
        },
      });

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if(paymentMethod) {
            this.selectedCard = paymentMethod.id;
            console.log(paymentMethod)
            resolve(true);
          } else {
            console.log("oh well");
            console.log(error.message);
            resolve(false);
          }

        }, 0);
      });

    }

    getEmailError() {
      if (this.email.hasError('required') || this.email.hasError('email')) {
        this.validEmail = false;
        return 'Please enter a valid e-mail';
      }
      this.validEmail = true;
      return this.email.hasError('email') ? 'Please enter a valid e-mail' : '';
    }

    evaluateSelectedCard() {
      console.log(this.selectedCard);
    }

    evaluateSubmitStatus() {
      for(let k of Object.keys(this.billingData)) {
        if(k != "address2") {
          if(!this.billingData[k] || this.billingData[k].length == 0) {
            this.submitEnabled = false
          } else {
            this.submitEnabled = true
          }
        }
      }
      if(this.billingData.state == this.states[0]) {
        this.submitEnabled = false
      }
      if (this.email.hasError('required') || this.email.hasError('email')) {
        this.submitEnabled = false;
      }
    }

    setToNewCard() {
      this.selectedCard = "newCard";
    }

    deleteCard(input : Card) {
      console.log(input.id);
      this.http.post("https://STRIPESERVER/detachpaymentmethod.php", "customerId="+this.currentUser!.stripeId+"&paymentMethodId="+input.id, httpOptions).subscribe((res : any) => {
        console.log('post result %o', res);

        if(res["error"]) {
          this.paymentError(res["error"]["message"]);
          this.displayMessage("Connection Error", "Dismiss");
        } else {
          this.displayMessage("Payment method removed", "");
          this.cards.splice(this.cards.findIndex(c => c.id == input.id), 1);
        }
      });
    }

    submitPayment() {
      this.cardError = undefined;
      this.checkoutInProgress = true;
      if(this.selectedCard == "newCard") {
      this.createPaymentMethod().then(r => {
        if(this.currentUser!.stripeId != undefined) {
          console.log("this.selectedCard " + this.selectedCard);

          this.http.post("https://STRIPESERVER/attachpaymentmethod.php", "customerId="+this.currentUser!.stripeId+"&paymentMethodId="+this.selectedCard, httpOptions).subscribe((res : any) => {
            console.log('post result %o', res);

              if(res["error"]) {
                this.paymentError(res["error"]["message"]);
              } else {
                this.finalizePayment();
              }
            });
          } else {
            this.finalizePayment();
          }
        })
      } else {
        this.finalizePayment();
      }
    }

    paymentError(message? : string) {
      this.displayErrorMessage(message ? message : "Error processing payment", "Dismiss");
      this.cardError = message ? message : "Error processing payment";
      this.checkoutInProgress = false;
    }

    displayErrorMessage(message: string, action: string) {
      let m = this._snackBar.open(message, action, {
        duration: 5000,
      });

      m.onAction().subscribe(() => {
        // this.login.updateDisplayingCompareEvents(true)
      });
    }

    displayMessage(message: string, action: string) {
      let m = this._snackBar.open(message, action, {
        duration: 5000,
      });

      m.onAction().subscribe(() => {
        // this.login.updateDisplayingCompareEvents(true)
      });
    }


}
