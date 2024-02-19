import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/compat/firestore/';
import { FirestoreModule } from '@angular/fire/firestore';

import * as firebase from 'firebase/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';
import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from '../model/user';
import { Product } from '../model/product';
import { Category } from '../model/category';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDateFormats, MAT_NATIVE_DATE_FORMATS, MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  products : Product[] = [];
  categories : Category[] = [];
  bag : Product[] = [];
  amountToLoad = 2;
  allProductsLoaded = false;

  databaseRef : AngularFirestore;

  constructor(firestore: AngularFirestore, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private globals : Globals, private router: Router, private _snackBar: MatSnackBar, private dialog : MatDialog) {
    this.databaseRef = firestore;
    login.bagObservable.subscribe(b => {
      this.bag = b;
    })
  }

  ngOnInit(): void {
    this.userConnect.fetchAllProduct(this.amountToLoad, true).then(p => {
      for(let item of p) {
        if(this.bag.find(b => b.id == item.id)) {
          item.inCart = true;
        }
      }
      this.products = p;
    }).catch(e => {
      this.displayError("Connection error", "");
    });
    this.userConnect.fetchCategories(undefined,undefined,undefined,undefined,undefined,"").then(c => {
      this.categories = c;
    });
  }

  toggleInCart(product : Product) {
    let cartId = this.databaseRef.firestore.collection("bag").doc().id;
    product.cartId = cartId;

    if(!product.inCart) {
      this.bag.push(product);
      this.displayMessage(product.name + " added to cart", "Go to cart");
      product.inCart = true;
    } else {

    }
    this.login.updateBag(this.bag);

    if(this.login.currentUserId != undefined && this.login.currentUserId != "") {
      this.userConnect.addToCart(this.login.currentUserId, product.id!).then(res => {

      }).catch(e => {
        this.displayError("Connection error", "");
      })
    }
  }

  loadAdditionalItems() {
    this.userConnect.fetchAllProduct(this.amountToLoad, true, this.products[this.products.length - 1].document).then(p => {
      for(let item of p) {
        if(this.bag.find(b => b.id == item.id)) {
          item.inCart = true;
        }
      }
      if(p.length != this.amountToLoad || p[p.length - 1].id == this.products[this.products.length - 1].id) {
        this.allProductsLoaded = true;
      }
      this.products = this.products.concat(p);
    }).catch(e => {
      console.log(e);
      this.displayError("Connection error", "");
    });
  }

  displayMessage(message: string, action: string) {
    let m = this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['primary-backgroundcolor']
    });

    m.onAction().subscribe(() => {
      this.router.navigate(['/cart/'] , { skipLocationChange: false });
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
