import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit, TemplateRef } from '@angular/core';

import * as firebase from 'firebase/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';import { UserConnect } from '../service/userconnect';
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
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {


    @ViewChild('refundDialog') refundDialog?: TemplateRef<any>;

    currentUser? : User;

    fileUploadPercent?: Observable<number | undefined>;
    imageUploadPercent?: Observable<number | undefined>;
    snapshot!: Observable<any>;
    downloadURL!: string;

    submitting = false;

    copyMessage = "Copy";

    copyInvoiceMessage =" Copy";

    orderId : string;

    order! : Purchase;

    itemsLoaded = false;

    items : Product[] = [];

    itemIds : string[] = [];

    orderDate = "";


    cardBrand = "";
    last4 = "";
    expiration = "";

    constructor(private router: Router,
        private route : ActivatedRoute, public extensions : Extensions, private userConnect : UserConnect,
    private login : LoginService, private globals : Globals, private _snackBar: MatSnackBar, private http: HttpClient, private dialog : MatDialog, private clipboard: Clipboard) {
      this.orderId = this.route.snapshot.params['id'];
      this.login.currentUserObservable.subscribe(u => {
        this.currentUser = u;
      });

      this.userConnect.fetchOrder(this.orderId).then(o => {
        this.order = o;
        this.orderDate = this.extensions.calendarTime(o.timeStamp!);
        this.itemIds = this.order.items;
        this.fetchItem(this.itemIds.pop());

        this.fetchCustomerData();
      });
    }

    ngOnInit(): void {

    }

    fetchItem(id? : string) {
      if(!id) {
        this.itemsLoaded = true
        return
      }
      this.userConnect.fetchProduct(id).then(item => {
        this.items.push(item);
        this.fetchItem(this.itemIds.pop());
      })

    }

    fetchCustomerData() {
      this.http.post("https://romebeats.com/stripeapi/retrievepaymentintent.php", "intent_id=" + this.order.invoiceId, httpOptions).subscribe((productData : any) => {
        console.log('result %o', productData);

        this.http.post("https://romebeats.com/stripeapi/retrievepaymentmethod.php", "id=" + productData["payment_method"], httpOptions).subscribe((productData2 : any) => {
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
      let copied = this.clipboard.copy(this.order.invoiceId!);
      this.copyInvoiceMessage = "Copied"
      setTimeout((u : any) => {
        this.copyInvoiceMessage = "Copy"
      }, 3000)
    }

    refundOrderButtonTapped() {
      this.dialog.open(this.refundDialog!, {
        width: '400px'
      });
    }

    refundOrder() {
    }

    dismissDialog() {
      this.dialog.closeAll()
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
