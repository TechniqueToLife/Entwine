import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/compat/app';
import * as firestore from 'firebase/compat/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';
import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from '../model/user';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDateFormats, MAT_NATIVE_DATE_FORMATS, MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import { Purchase } from '../model/purchase';
import { Product } from '../model/product';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};

@Component({
  selector: 'app-orderadmin',
  templateUrl: './orderadmin.component.html',
  styleUrls: ['./orderadmin.component.css']
})
export class OrderadminComponent implements OnInit, OnDestroy {

  @ViewChild('refundDialog') refundDialog?: TemplateRef<any>;
  @ViewChild('trackingNumberInput') trackingNumberInput?: TemplateRef<any>;

  currentUser? : User;
  databaseRef : AngularFirestore;

  task!: AngularFireUploadTask;

  fileUploadPercent?: Observable<number | undefined>;
  imageUploadPercent?: Observable<number | undefined>;
  snapshot!: Observable<any>;
  downloadURL!: string;

  submitting = false;

  copyMessage = "Copy";

  copyInvoiceMessage =" Copy";

  orderId : string;

  order! : Purchase;

  selectedItems : Product[] = [];

  itemsLoaded = false;

  items : Product[] = [];

  itemIds : string[] = [];

  tracking = "";
  notes = "";

  trackingNumberInputValue? : string;
  carrierInputValue? : string;
  carriers = ["USPS", "UPS", "FEDEX", "DHL", "Other"];


  cardBrand = "";
  last4 = "";
  expiration = "";

  customRefundAmount = false;
  customRefundAmountInput? : number;
  refundShipping = false;

  constructor(firestore: AngularFirestore, private router: Router,
      private route : ActivatedRoute, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private globals : Globals, private _snackBar: MatSnackBar, private http: HttpClient, private storage: AngularFireStorage, private dialog : MatDialog, private clipboard: Clipboard) {
    this.orderId = this.route.snapshot.params['id'];
    this.databaseRef = firestore;
    this.login.updateInAdmin(true);
    this.login.currentUserObservable.subscribe(u => {
      this.currentUser = u;
    });

    this.userConnect.fetchOrder(this.orderId).then(o => {
      this.order = o;
      this.itemIds = this.order.variationData;
      this.fetchItem(this.itemIds.pop());
      console.log(this.order);

      this.fetchCustomerData();
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.login.updateInAdmin(false);
  }

  fetchItem(id? : string) {
    if(!id) {
      this.itemsLoaded = true;
      if(this.order.items.length == 1) {
        this.items[0].selected = true;
      }
      return
    }
    let productId = id;
    let quantity = "0";
    let selectedOption : string;
    if(id.split(":").length > 1) {
      quantity = id.split(":")[0];
      productId = id.split(":")[1];
      selectedOption = id.split(":")[2];
    }

    this.userConnect.fetchProduct(productId).then(item => {
      item.selectedVariation = selectedOption;
      item.quantity = +quantity;
      this.items.push(item);

      this.fetchItem(this.itemIds.pop());
    })

  }

  fetchCustomerData() {
    this.http.post("https://STRIPESERVER/retrievepaymentintent.php", "intent_id=" + this.order.invoiceId, httpOptions).subscribe((productData : any) => {
      console.log('result %o', productData);

      this.http.post("https://STRIPESERVER/retrievepaymentmethod.php", "id=" + productData["payment_method"], httpOptions).subscribe((productData2 : any) => {
        console.log('result %o', productData2);
        let card = productData2["card"];
        console.log("CARD " + card);
        this.cardBrand = card["brand"];
        this.last4 = card["last4"];
        this.expiration = card["exp_month"] + "/" + card["exp_year"];
      });
    });
  }

  evaluateSubmitStatus() {

  }

  copyId() {
    let copied = this.clipboard.copy(this.order.id!);
    this.copyMessage = "Copied"
    setTimeout((u : any) => {
      this.copyMessage = "Copy"
    }, 3000)
  }

  copyInvoiceId() {
    this.clipboard.copy(this.order.invoiceId!);
    this.copyInvoiceMessage = "Copied"
    setTimeout((u : any) => {
      this.copyInvoiceMessage = "Copy"
    }, 3000)
  }

  openTrackingNumberInput() {
    this.trackingNumberInputValue = undefined;
    this.trackingNumberInputValue = undefined;
    this.selectedItems = [];
    for(let item of this.items) {
      if(item.selected) {
        this.selectedItems.push(item)
      }
    }

    this.carrierInputValue = this.carriers[0];

    this.dialog.open(this.trackingNumberInput!, {
      width: '500px'
    });
  }

  updateTrackingNumber() {

  }

  submitTrackingNumber() {
    for(let item of this.selectedItems) {
      item.trackingNumber = this.trackingNumberInputValue;
      item.carrier = this.carrierInputValue;
    }

    let batch = this.databaseRef.firestore.batch();
    let itemsData: { image: string; selectedoption: string; trackingnumber: string; name: string; carrier: string}[] = [];
    for(let item of this.selectedItems) {
      let itemName = item.id;
      if(item.selectedVariation) {
        itemName += item.selectedVariation
      }



      let union = firebase.default.firestore.FieldValue.arrayUnion(itemName + ":" + this.carrierInputValue + ":" + this.trackingNumberInputValue);

      let purchaseHistoryRef = this.databaseRef.firestore.collection("purchaseHistory").doc(this.order.email).collection("purchaseHistory").doc(this.order.id);
      let orderRef = this.databaseRef.firestore.collection("orders").doc(this.order.id);

      batch.update(purchaseHistoryRef, {trackingNumbers : union});
      batch.update(orderRef, {trackingNumbers : union});



      let imgUrlSplit = item.imageUrl!.split("/o/");
      // %2F

      imgUrlSplit[1] = imgUrlSplit[1].replace(/%2F/g, "%forward%");
      let imgUrl = imgUrlSplit[0] + "/o/" + imgUrlSplit[1];
      imgUrl = imgUrl.replace("&", "%ampersand%");


      itemsData.push({image : imgUrl, selectedoption : item.selectedVariation ?? "", trackingnumber : item.trackingNumber!, name : item.name!, carrier : this.carrierInputValue!});

    }
    batch.commit().then(_ => {
      this.displayMessage("Tracking number updated", "Dismiss");

      //Replace possible "&" and / symbols that break the post request since they are used to add vars or JSON decoded
      let jsonData = JSON.stringify(itemsData);
      console.log(jsonData);
          this.http.post("https://STRIPESERVER/trackingnumberupdate.php", "data=" + jsonData + "&first_name="+this.order.firstName + "&email="+this.order.email +"&order_number="+this.order.id, httpOptions).subscribe((res : any) => {
            console.log(res);
            this.dialog.closeAll();
          });
    }).catch(e => {
      this.displayError("Connection error", "Dismiss");
    });



  }

  refundOrderButtonTapped() {
    this.dialog.open(this.refundDialog!, {
      width: '400px'
    });
  }

  customRefundAmountToggled() {
    this.refundShipping = false;
  }

  refundOrder() {
    let amount = this.order.total;

    if(this.refundShipping) {
      amount = this.order.total + this.order.shippingTotal;
    }

    if(this.customRefundAmount) {
      amount = this.customRefundAmountInput! * 100;
    }

    let amountstring = (amount * 0.01).toFixed(2);
    console.log(amount);
    console.log(amountstring);


    this.http.post("https://STRIPESERVER/refund.php", "payment_intent_id=" + this.order.invoiceId + "&amount="+ amount, httpOptions).subscribe((res : any) => {
      console.log(res);
      if(res["status"] == "succeeded") {
        this.displayMessage("Order refunded", "Dismiss");
        let batch = this.databaseRef.firestore.batch();
        let purchaseHistoryRef = this.databaseRef.firestore.collection("purchaseHistory").doc(this.order.email).collection("purchaseHistory").doc(this.order.id);
        let orderRef = this.databaseRef.firestore.collection("orders").doc(this.order.id);
        batch.update(purchaseHistoryRef, {status : "refunded", refundedAmount : amount});
        batch.update(orderRef, {status : "refunded", refundedAmount : amount});
        this.order.status = "refunded";
        this.dialog.closeAll();

        batch.commit().then(_ => {

        }).catch(e => {
          this.displayError("Error updating order, order was refunded", "Dismiss");
        });
        let amountstring = (amount * 0.01).toFixed(2);
        this.http.post("https://STRIPESERVER/refundemail.php", "ordernumber=" + this.order.id + "&first_name=" + this.order.firstName + "&email=" + this.order.email + "&amount=$" + amountstring, httpOptions).subscribe((productData : any) => {
          console.log('result %o', productData);

        });
      } else {
        this.displayError("Error refunding order", "Dismiss");
      }
    });
  }

  dismissDialog() {
    this.dialog.closeAll();
  }

  displayMessage(message: string, action: string) {
    let m = this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['primary-backgroundcolor']
    });

    m.onAction().subscribe(() => {
      m.dismiss()
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

}
