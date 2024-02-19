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
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import { Purchase } from '../model/purchase';
import { Product } from '../model/product';

@Component({
  selector: 'app-paymentcomplete',
  templateUrl: './paymentcomplete.component.html',
  styleUrls: ['./paymentcomplete.component.css']
})
export class PaymentcompleteComponent implements OnInit {

  purchaseId? : string;
  purchase! : Purchase;
  items : Product[] = [];
  itemsLoaded = false;

  constructor(private login : LoginService, private userConnect : UserConnect) {
    login.purchaseObservable.subscribe(id => {
      this.userConnect.fetchOrder(id).then(purchase => {
        this.purchase = purchase;

        for(let item of purchase.items) {
          this.userConnect.fetchProduct(item).then(p => {
            this.items.push(p);
            if(this.items.length == purchase.items.length) {
              this.itemsLoaded = true;
            }
          });
        }
      })
    });

  }

  ngOnInit(): void {

  }

}
