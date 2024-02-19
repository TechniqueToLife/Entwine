import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import * as firebase from 'firebase/app';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from '../model/user';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDateFormats, MAT_NATIVE_DATE_FORMATS, MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';
import { Purchase } from '../model/purchase';
import { Product } from '../model/product';
import { ShippingOption } from '../model/stripeshippingoption';

@Component({
  selector: 'app-shipping-admin',
  templateUrl: './shipping-admin.component.html',
  styleUrls: ['./shipping-admin.component.css']
})
export class ShippingAdminComponent implements OnInit, OnDestroy {

    currentUser? : User;

    shippingOptions : ShippingOption[] = [];

    newOption = new ShippingOption({id : "", label : "", detail : "", amount : 0});

    constructor(firestore: AngularFirestore, private router: Router,
        private route : ActivatedRoute, public extensions : Extensions, private userConnect : UserConnect,
    private login : LoginService, private globals : Globals, private _snackBar: MatSnackBar, private http: HttpClient, private storage: AngularFireStorage, private dialog : MatDialog, private clipboard: Clipboard) {
      this.login.updateInAdmin(true);
      this.login.currentUserObservable.subscribe(u => {
        this.currentUser = u;
      });

      this.userConnect.fetchShippingOptions().then(s => {
        this.shippingOptions = s;
        for(let o of s) {
          o.amount = +(o.amount! * 0.01).toFixed(2);
        }
      });

    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
      this.login.updateInAdmin(false);
    }

    evaluateSubmitStatus() {

    }

    updateShippingOption(input : ShippingOption) {
      //Make a new shipping option to submit, we aren't editing it directly so the input box can remain the same
      let updatedOption = new ShippingOption({id : input.id, label : input.label, amount : Math.round(input.amount * 100), detail : input.detail, })

      this.userConnect.addShippingOption(updatedOption).then(_ => {

        //refresh
        this.userConnect.fetchShippingOptions().then(s => {
          this.shippingOptions = s;
          for(let o of s) {
            o.amount = +(o.amount! * 0.01).toFixed(2);
          }
        });

        this.displayMessage("Shipping option updated", "dismiss");

      }).catch(e => {
        this.displayError("Connection Error", "dismiss");

      });
    }

    submit() {
      this.newOption.amount = Math.round(this.newOption.amount * 100);

      this.userConnect.addShippingOption(this.newOption).then(_ => {

        //refresh
        this.userConnect.fetchShippingOptions().then(s => {
          this.shippingOptions = s;
          for(let o of s) {
            o.amount = +(o.amount! * 0.01).toFixed(2);
          }
        });

        this.displayMessage("Shipping option updated", "dismiss");

        this.newOption = new ShippingOption({id : "", label : "", detail : "", amount : 0});
      }).catch(e => {
        this.displayError("Connection Error", "dismiss");

      });
    }

    displayMessage(message: string, action: string) {
      let m = this._snackBar.open(message, action, {
        duration: 5000,
        panelClass: ['primary-backgroundcolor']
      });

      m.onAction().subscribe(() => {
        m.dismiss()
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
