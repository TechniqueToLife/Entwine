import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit } from '@angular/core';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
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
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

    products : Product[] = [];
    categories : Category[] = [];
    bag : Product[] = [];
    categoryId! : string;
    category! : Category;

    categoryIds : string[] = [];

    amountToLoad = 2;

    allProductsLoaded = false;

    constructor(private route : ActivatedRoute, firestore: AngularFirestore, public extensions : Extensions, private userConnect : UserConnect,
    private login : LoginService, private globals : Globals, private router: Router, private _snackBar: MatSnackBar, private storage: AngularFireStorage, private dialog : MatDialog) {
      login.bagObservable.subscribe(b => {
        this.bag = b;
      })
    }

    ngOnInit(): void {

      this.categoryId = this.route.snapshot.params['id'];
      console.log(this.categoryId);
      this.userConnect.fetchCategory(this.categoryId).then(c => {
        this.category = c;


        this.userConnect.fetchCategories(undefined,undefined,undefined,undefined,undefined,this.categoryId).then(c => {
          this.categories = c;
          this.categoryIds = [this.categoryId];
          for(let cc of c) {
            this.categoryIds.push(cc.id!);
          }
          this.userConnect.fetchProducts(this.amountToLoad,undefined,undefined,undefined,undefined,this.categoryIds).then(p => {
            this.products = p;
            console.log(this.categoryIds);
            console.log(p);
          }).catch(e => {
            this.displayError("Connection error", "");
          });
        });

      });
    }

    toggleInCart(product : Product) {
      if(!product.inCart) {
        this.bag.push(product);
        this.displayMessage(product.name + " added to cart", "Go to cart");
        product.inCart = true;
      } else {

      }
      this.login.updateBag(this.bag);

      if(this.login.currentUserId != undefined) {
        this.userConnect.addToCart(this.login.currentUserId, product.id!).then(res => {

        }).catch(e => {
          this.displayError("Connection error", "");
        })
      }
    }


    loadAdditionalItems() {
      this.userConnect.fetchProducts(this.amountToLoad,undefined,this.products[this.products.length - 1],undefined,undefined,this.categoryIds).then(p => {
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
