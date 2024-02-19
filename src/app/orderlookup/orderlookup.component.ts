import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit, TemplateRef } from '@angular/core';
import * as firebase from 'firebase/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import { User } from '../model/user';
import { MatTable } from '@angular/material/table';
import { Purchase } from '../model/purchase';

@Component({
  selector: 'app-orderlookup',
  templateUrl: './orderlookup.component.html',
  styleUrls: ['./orderlookup.component.css']
})
export class OrderlookupComponent implements OnInit, AfterViewInit {

  currentUser? : User;


    orders : Purchase[] = [];

    displayedColumns = [ 'orderId', 'total', 'date', 'status'];

    registered = false;

    params : string[] = [];

    inputWidth = 500;
    searchInput? : string;
    autocompleteorders : Purchase[] = [];
    selectedOrder? : Purchase;


    @ViewChild(MatTable) matTable?: MatTable<any>;


  constructor(private router: Router,
      private route : ActivatedRoute, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private globals : Globals, private _snackBar: MatSnackBar, private http: HttpClient, private dialog : MatDialog) {


   }

  ngOnInit(): void {
  }


  ngAfterViewInit(): void {
    this.login.currentUserObservable.subscribe(u => {
      this.currentUser = u;
      if(u.email && u.email!.length != 0) {
        this.fetchOrders(u.email!);
      }
    });
  }


  loadPreviousorders() {
    this.userConnect.fetchOrders(20, undefined, this.orders[0], this.currentUser!.email).then(orders => {
      this.orders = orders;
      this.matTable?.renderRows();
    })
  }

  loadNextorders() {
    this.userConnect.fetchOrders(20, this.orders[this.orders.length - 1], undefined, this.currentUser!.email).then(orders => {
      this.orders = orders;
      this.matTable?.renderRows();
    })
  }

  selectOrder(input : Purchase) {
    console.log(input);
    // this.orderId = input.id;
    this.selectedOrder = input;
    this.router.navigate(["/o/"+this.selectedOrder.id] , { skipLocationChange: false });
  }


  fetchOrders(email : string) {
    this.userConnect.fetchOrders(20, undefined, undefined, email).then(orders => {
      this.orders = orders;
    });
  }

  search() {
    this.router.navigate(["/o/"+this.searchInput] , { skipLocationChange: false });
  }

}
