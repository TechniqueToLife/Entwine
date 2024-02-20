import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import * as firebase from 'firebase/app';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from '../model/user';
import { Product } from '../model/product';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  currentUser? : User;
  databaseRef : AngularFirestore;
  cart : Product[] = [];

  cartTotal = 0;

  checkoutEnabled = true;

  //keep a copy of the item to know the original quantity, if needed

  constructor(firestore: AngularFirestore, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private globals : Globals, private router : Router, private _snackBar: MatSnackBar, private dialog : MatDialog) {
      this.databaseRef = firestore;
      this.login.updateInAdmin(false);

      this.login.currentUserObservable.subscribe(u => {
          this.currentUser = u;
      });

      login.bagObservable.subscribe(b => {
        console.log("bag updated");
        console.log(b);
        this.cart = [];
        this.checkoutEnabled = true;
        this.cartTotal = 0;
        for(let product of b) {
          this.userConnect.fetchProduct(product.id!).then(p => {
            p.cartQuantity = product.cartQuantity;
            p.cartId = product.cartId;
            p.selectedVariation = product.selectedVariation;
            this.cart.push(p);
            this.cartTotal += p.price! * p.cartQuantity!;
            console.log(p);
            if(p.selectedVariation) {
              let varData = p.variationQuantities as any;
              console.log(varData[p.selectedVariation]);
              console.log(varData);
              if(p.selectedVariation && p.cartQuantity! > varData[p.selectedVariation]) {
                p.cartNote = "Only " + varData[p.selectedVariation] + " in stock, please adjust your quantity";
                if(varData[p.selectedVariation] == 0) {
                  p.cartNote = "This item is out of stock";
                  this.checkoutEnabled = false;
                }
              }
            }

            if(p.cartQuantity! > p.quantity!) {
              p.cartNote = "Only " + p.quantity + " in stock, please adjust your quantity";
              if(p.quantity == 0) {
                p.cartNote = "This item is out of stock";
                this.checkoutEnabled = false;
              }
            }
          })
        }
      });
    }

  ngOnInit(): void {

  }

  gotoProduct(id : string) {
    this.router.navigate(["p/" + id] , { skipLocationChange: false });
  }

  updateQuantity(item : Product, amount : number) {
    if(item.cartQuantity == 1 && amount == -1 || item.cartQuantity! + amount > item.quantity!) {
      item.cartNote = "Maximum quantity selected";
      return
    }

    if(item.selectedVariation) {
      let varData = item.variationQuantities as any;

      if(item.selectedVariation && item.cartQuantity == 1 && amount == -1 || item.cartQuantity! + amount > varData[item.selectedVariation]) {
        item.cartNote = "Maximum quantity selected";
        return
      }
    }

    item.cartQuantity! += amount;
    this.login.updateBag(this.cart);
    if(this.currentUser && this.currentUser.userId) {
      this.userConnect.addToCart(this.currentUser!.userId!, item.id!, item.cartQuantity!, item.selectedVariation, item.cartId).then(u => {
        console.log("updated quantity");
      });
    }
    console.log(item);
  }

  removeItem(item : Product) {
    this.cart.splice(this.cart.findIndex(s => s.cartId === item.cartId), 1);
    this.login.updateBag(this.cart);
    if(this.currentUser && this.currentUser.userId) {
      this.userConnect.removeFromCart(this.currentUser!.userId!, item.cartId!).then(u => {
        console.log("removed item");
      });
    }
  }

  showCartQuantity() {
      console.log(this.cartTotal);

  }

}
