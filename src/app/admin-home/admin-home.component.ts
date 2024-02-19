import { Component, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import * as firebase from 'firebase/app';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from '../model/user';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.css']
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  currentUser? : User;
  databaseRef : AngularFirestore;

  constructor(firestore: AngularFirestore, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private globals : Globals, private _snackBar: MatSnackBar, private dialog : MatDialog) {
    this.databaseRef = firestore;
    this.login.updateInAdmin(true);

      this.login.currentUserObservable.subscribe(u => {
        this.currentUser = u;
    })
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.login.updateInAdmin(false);
  }

}
