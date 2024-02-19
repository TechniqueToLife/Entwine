import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LoginService } from '../service/login.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import * as firebase from 'firebase/compat';
import { Product } from '../model/product';
import { Extensions } from '../helpers/extensions';
import { UserConnect } from '../service/userconnect';
import { Globals } from '../helpers/globals';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { startWith, map } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatTable } from '@angular/material/table';

@Component({
  selector: 'app-productlist',
  templateUrl: './productlist.component.html',
  styleUrls: ['./productlist.component.css']
})
export class ProductlistComponent implements OnInit {


    databaseRef : AngularFirestore;

    products : Product[] = [];

    displayedColumns = [ 'productId', 'productName', 'category', 'uniqueUrl', 'archived'];

    uniqueUrl = false;
    requireArchived = false;

    params : string[] = [];

    inputWidth = 500;
    searchNameParam? : string;
    autocompleteproducts : Product[] = [];
    selectedProduct? : Product;


    @ViewChild(MatTable) matTable?: MatTable<any>;


  constructor(db: AngularFirestore,
    private router: Router,
    private route : ActivatedRoute,
    public loginData : LoginService, private extensions : Extensions, private userConnect : UserConnect, private globals : Globals, private _snackBar: MatSnackBar) {
      this.databaseRef = db;
      this.loginData.updateInAdmin(true);
  }

  ngOnInit(): void {

  }


  ngAfterViewInit(): void {
    this.searchProduct();
  }

  searchProduct() {
    this.userConnect.fetchProducts(20, this.params, undefined, undefined, this.searchNameParam).then(products => {
      this.products = products;
      this.matTable?.renderRows();
    });
  }

  ngOnDestroy(): void {
    this.loginData.updateInAdmin(false);
  }

  loadPreviousproducts() {
    this.userConnect.fetchProducts(20, this.params, undefined, this.products[0], this.searchNameParam).then(products => {
      this.products = products;
      this.matTable?.renderRows();
    })
  }

  loadNextproducts() {
    this.userConnect.fetchProducts(20, this.params, this.products[this.products.length - 1], undefined, this.searchNameParam).then(products => {
      this.products = products;
      this.matTable?.renderRows();
    })
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
    this.router.navigate(["/productsettings/"+this.selectedProduct.id] , { skipLocationChange: false });
  }


  search() {
    this.userConnect.fetchProducts(20, this.params, undefined, undefined, this.searchNameParam).then(products => {
      this.products = products;
    });
  }

  uniqueUrlToggled() {

  }

  archivedToggled() {

  }

}
