import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LoginService } from '../service/login.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import * as firebase from 'firebase/compat';
import { Purchase } from '../model/purchase';
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
  selector: 'app-orderlist',
  templateUrl: './orderlist.component.html',
  styleUrls: ['./orderlist.component.css']
})
export class OrderlistComponent implements OnInit, AfterViewInit {

  databaseRef : AngularFirestore;

  orders : Purchase[] = [];

  displayedColumns = [ 'orderId', 'email', 'total', 'date', 'status','archived'];

  registered = false;

  params : string[] = [];

  searchByEmail = false;

  inputWidth = 500;
  searchNameParam? : string;
  autocompleteorders : Purchase[] = [];
  selectedOrder? : Purchase;

  requireArchived = false;

  @ViewChild(MatTable) matTable?: MatTable<any>;


  constructor(db: AngularFirestore,
  private router: Router,
  private route : ActivatedRoute,
  public loginData : LoginService, public extensions : Extensions, private userConnect : UserConnect, private globals : Globals, private _snackBar: MatSnackBar) {
    this.databaseRef = db;
    this.loginData.updateInAdmin(true);
  }

  ngOnInit(): void {

  }


  ngAfterViewInit(): void {
    this.searchOrders();
  }

  searchOrders() {
    this.userConnect.fetchOrders(20, undefined, undefined).then(orders => {
      this.orders = orders;
      this.matTable?.renderRows();
    });
  }

  ngOnDestroy(): void {
    this.loginData.updateInAdmin(false);
  }

  loadPreviousorders() {
    this.userConnect.fetchOrders(20, undefined, this.orders[0], this.searchByEmail ? this.searchNameParam : undefined).then(orders => {
      this.orders = orders;
      this.matTable?.renderRows();
    })
  }

  loadNextorders() {
    this.userConnect.fetchOrders(20, this.orders[this.orders.length - 1], undefined, this.searchByEmail ? this.searchNameParam : undefined).then(orders => {
      this.orders = orders;
      this.matTable?.renderRows();
    })
  }

  searchOrdersAutocomplete() {
    this.userConnect.fetchOrders(20, undefined, undefined, undefined).then(orders => {
      this.autocompleteorders = orders;
    });
  }

  selectOrder(input : Purchase) {
    console.log(input);
    // this.orderId = input.id;
    this.selectedOrder = input;
    this.router.navigate(["/o/"+this.selectedOrder.id] , { skipLocationChange: false });
  }


  search() {
    this.searchByEmail = true;
    this.userConnect.fetchOrders(20, undefined, undefined, this.searchByEmail ? this.searchNameParam : undefined).then(orders => {
      this.orders = orders;
    });
  }

  removeSearchByEmail() {
    this.searchByEmail = false;
    this.searchNameParam = undefined;
    this.search();
  }

}
