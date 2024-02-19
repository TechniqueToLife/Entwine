import { Component, OnInit, HostListener, ElementRef, ViewChild, Renderer2, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from '../service/login.service';
import { User } from '../model/user';
import { UserConnect } from '../service/userconnect';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Globals } from '../helpers/globals';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';
import * as auth from 'firebase/auth';
import { Product } from '../model/product';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

    user? : User;

    mobileQuery: MediaQueryList;

    private _mobileQueryListener: () => void;

    searchResultProducts : Product[] = [];

    searching = false;
    searchNameParam? : string;
    autocompleteproducts : Product[] = [];
    selectedProduct? : Product;

    bagCount = 0;

    @ViewChild('searchBox') searchBox: ElementRef | undefined;

  constructor(public auth: Auth, private loginData : LoginService, private router: Router, private route: ActivatedRoute, public dialog: MatDialog, private userConnect : UserConnect, private globals : Globals, private changeDetector : ChangeDetectorRef, private _bottomSheet: MatBottomSheet, private changeDetectorRef: ChangeDetectorRef, private media: MediaMatcher, private _snackBar: MatSnackBar) {
      this.mobileQuery = media.matchMedia('(max-width: 768px)');
      this._mobileQueryListener = () => changeDetectorRef.detectChanges();
      this.mobileQuery.addListener(this._mobileQueryListener);

      this.loginData.bagBadgeObservable.subscribe(b => {this.bagCount = b});

      this.auth.onAuthStateChanged((returnedUser) => {
        if(returnedUser) {
          this.loginData.updateCurrentUserId(returnedUser.uid);
          this.userConnect.fetchUserFromId(returnedUser.uid).then((returnedUser => {
            this.user = returnedUser;
            console.log("Updated user from UID");
            this.userConnect.fetchBag(this.loginData.currentUserId!).then(b => {
              console.log(b);
              this.loginData.updateBag(b);

            })
          }));
        } else {
          let bagCookie = localStorage.getItem('cart');

          if(bagCookie) {
            console.log("Got a bag");
            let parsedBag = JSON.parse(bagCookie);
            let bag : Product[] = [];
            for(let b of parsedBag) {
              console.log(b);
              bag.push(new Product(b))
            }
            this.loginData.updateBag(bag);
          }
          console.log("no user");
          this.loginData.updateCurrentUserId("");
        }
      })
    }

  ngOnInit(): void {

  }


  login() {
    this.router.navigate(['/login/'] , { skipLocationChange: false });
  }

  logout() {
    this.auth.signOut().then(r => {
      // this.loginData.updateCurrentUserId(undefined);
      this.reload();
    });
  }

  gotoBag() {
    // this.loginData.toggleViewBag();
    this.router.navigate(['/cart/'] , { skipLocationChange: false });
  }

  gotoSettings() {
    this.router.navigate(['/admin/'] , { skipLocationChange: false });
  }

  gotoAdmin() {
    this.router.navigate(['/admin/'] , { skipLocationChange: false });
  }

  searchProductsAutocomplete() {
    this.userConnect.fetchProducts(20, undefined, undefined, undefined, this.searchNameParam).then(products => {
      this.autocompleteproducts = products;
    });
  }

  selectProduct(input : Product) {
    console.log(input);
    // this.productId = input.id;
    this.selectedProduct = input;
    this.router.navigate(['/p/' +this.selectedProduct.id] , { skipLocationChange: false });
  }

  searchToggle() {
    if(this.searching) {
      this.search();
      return;
    }
    this.searching = !this.searching;
    this.searchBox!.nativeElement.focus();
  }

  search() {
    this.userConnect.fetchProducts(20, undefined, undefined, undefined, this.searchNameParam).then(products => {
      this.searchResultProducts = products;
    });
  }

  reload() {
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([this.router.url], { relativeTo: this.route }).then(() => {
      window.location.reload();
    });
  }

}
