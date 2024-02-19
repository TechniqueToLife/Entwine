import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { LoginService } from '../service/login.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import * as firebase from 'firebase/compat';
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
import { User } from '../model/user';

@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css']
})
export class UserlistComponent implements OnInit {

  databaseRef : AngularFirestore;

  users : User[] = [];

  displayedColumns = [ 'userId', 'userName', 'email', 'archived'];

  registered = false;

  params : string[] = [];

  inputWidth = 500;
  searchNameParam? : string;
  autocompleteusers : User[] = [];
  selectedUser? : User;


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
  this.searchUser();
  }

  searchUser() {
  this.userConnect.fetchUsers(20, undefined, undefined).then(users => {
    this.users = users;
    this.matTable?.renderRows();
  });
  }

  ngOnDestroy(): void {
  this.loginData.updateInAdmin(false);
  }

  loadPrevioususers() {
  this.userConnect.fetchUsers(20, undefined, this.users[0]).then(users => {
    this.users = users;
    this.matTable?.renderRows();
  })
  }

  loadNextusers() {
  this.userConnect.fetchUsers(20, this.users[this.users.length - 1], undefined).then(users => {
    this.users = users;
    this.matTable?.renderRows();
  })
  }

  searchUsersAutocomplete() {
  this.userConnect.fetchUsers(20, undefined, undefined, undefined).then(users => {
    this.autocompleteusers = users;
  });
  }

  selectUser(input : User) {
  console.log(input);
  // this.userId = input.id;
  this.selectedUser = input;
  this.router.navigate(["/u/"+this.selectedUser.userId] , { skipLocationChange: false });
  }


  search() {
  this.userConnect.fetchUsers(20, undefined, undefined).then(users => {
    this.users = users;
  });
  }

  toggleRegistered() {
  this.registered = !this.registered;
  }

}
