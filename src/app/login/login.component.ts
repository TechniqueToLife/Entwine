import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

import { LoginService } from '../service/login.service';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/compat/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserConnect } from '../service/userconnect';
import { COMMA, ENTER, MAC_ENTER } from '@angular/cdk/keycodes';
import { Product } from '../model/product';

import * as firebase from 'firebase/compat';
import '@firebase/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

      loginMessage? : string;
      loginError? : string;

      hide = true;
      loggingIn = false;


      constructor(public auth: AngularFireAuth, private router: Router, private loginData : LoginService, private userConnect : UserConnect, private _snackBar: MatSnackBar) {
      }

      focusedFormElement = '';
      email = "";
      password = "";
      passwordText = "";

      focusFormElement(input : string) {
        console.log("focused " + input);
        this.focusedFormElement = input;
      }

      ngOnInit() {
        this.auth.authState.subscribe((returnedUser) => {
          if(returnedUser) {

            this.loginData.updateCurrentUserId(returnedUser.uid);
            this.userConnect.fetchUserFromId(returnedUser.uid).then((returnedUser => {
              console.log("Updated user from UID");
            }));
          } else {
            console.log("no user");
            this.loginData.updateCurrentUserId("");
            // this.router.navigate(['/'] , { skipLocationChange: false });
          }


        })
      }

      checkValidForm() {

      }


      async login() {
        this.loginMessage = "";
        this.loginError = "";
        this.loggingIn = true;

          const promise = this.auth.signInWithEmailAndPassword(this.email, this.passwordText);
          promise.then(u => {
            this.loggingIn = false;

            this.router.navigate(['/'] , { skipLocationChange: false });
          })
            .catch(e => {
              this.loggingIn = false;

              console.log(e);
            if(e.code == "auth/wrong-password") {
                this.loginError = "Invalid username / password"
              } else if(e.code == "auth/user-not-found") {
                this.loginError = "User not found"
              } else if(e.code == "auth/too-many-requests") {
              this.loginError = "This account has been temporarily locked for too many failed login attempts"
            }

        });
      }



      logout() {
        this.auth.signOut();
      }

      displayMessage(message: string, action: string) {
        let m = this._snackBar.open(message, action, {
          duration: 5000,
        });

        m.onAction().subscribe(() => {
          m.dismiss();
        });
      }


}
