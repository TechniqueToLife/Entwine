import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { FormControl, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import * as auth from 'firebase/auth';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { UserConnect } from '../service/userconnect';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import { LoginService } from '../service/login.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgForm } from '@angular/forms';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  @ViewChild('registrationDialog') registrationDialog?: TemplateRef<any>;

  email = new FormControl('', [Validators.required, Validators.email]);


  reactiveForm?: FormGroup;
  reactiveManualForm?: FormGroup;

  emailText? : string;
  passwordText? : string;
  passwordTextVerify? : string;

  password! : FormControl;
  passwordVerify!: FormControl;

  firstName? : string;
  lastName? : string;

  validInput = false;
  validEmail = false;
  validPassword = false;

  registrationStatus? : string;

  registering = false;

  hide = true;

  searchName? : string;

  databaseRef? : AngularFirestore;

  constructor(public afAuth: AngularFireAuth, private router: Router, private userConnect : UserConnect, private extensions : Extensions, private globals : Globals, private loginData : LoginService, private _snackBar: MatSnackBar, private http: HttpClient, private dialog : MatDialog) {
  }

  ngOnInit(): void {
    this.reactiveForm = new FormGroup({
      recaptchaReactive: new FormControl(null, Validators.required),
    });

    this.reactiveManualForm = new FormGroup({
      recaptchaManualReactive: new FormControl(null, Validators.required),
    });

    this.password = new FormControl('', [Validators.required, Validators.minLength(8)]);
    this.passwordVerify = new FormControl('', [Validators.required, Validators.minLength(8)]);
  }

  ngOnDestroy(): void {
    this.dialog.closeAll();
  }

  getEmailError() {
    if (this.email.hasError('required') || this.email.hasError('email')) {
      this.validEmail = false;
      return 'Please enter a valid e-mail';
    }
    this.validEmail = true;
    return this.email.hasError('email') ? 'Please enter a valid e-mail' : '';
  }

  validatePasswordConfirmation(control:FormControl): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null =>
        this.password!.value != this.passwordVerify!.value
            ? null : {confirmPassword: true};
  }

  getPasswordError() {
    console.log("get password error?");
    console.log(this.password!.errors);
    if(this.password!.hasError('required')) {
      this.validPassword = false;
      return 'Please enter a valid password';
    }
    if(this.password!.hasError('confirmPassword')) {
      this.validPassword = false;
      console.log("ADD MATCH PASSWORD ERROR");
      return 'Password need to match';
    }
    if(this.password!.hasError('minLength')) {
      this.validPassword = false;
      return 'Password must be at least 8 characters';
    }
    this.validPassword = true;
    return ''
  }

  checkValidForm() {
    this.getEmailError();
    this.getPasswordError();
    console.log(this.validPassword);
    if(this.validPassword) {
      this.validPassword = this.password!.value && this.passwordVerify!.value && this.password!.value == this.passwordVerify!.value && this.password!.value.length > 6 && this.passwordVerify!.value.length > 6
    }
    console.log("this.validEmail " + this.validEmail);
    console.log("this.validPassword " + this.validPassword);
    this.validInput = this.validEmail && this.validPassword && this.firstName != undefined && this.lastName != undefined && this.extensions.isAlphaNumericWithSpacesAndDashes(this.firstName!) && this.extensions.isAlphaNumericWithSpacesAndDashes(this.lastName!);
  }

  register() {
    this.registering = true;
      this.afAuth.createUserWithEmailAndPassword(this.email.value!, this.password!.value).then((newUser) => {
        if(!newUser.user) {
          this.registering = false;
          this.displayError("Error Registering User", "Dismiss");
          return
        }

        this.http.post("https://romebeats.com/stripeapi/createcustomer.php", "userId="+newUser.user!.uid+"&email="+newUser.user!.email!.toLowerCase(), httpOptions).subscribe((res : any) => {
          if(res["error"]) {
            this.registering = false;
            this.displayError("Error Registering User", "Dismiss");
            return
          }

          this.registrationStatus = "Registration complete, id: " + newUser.user!.uid;
          this.userConnect.updateUser(newUser.user!.uid, {userId : newUser.user!.uid, email : newUser.user!.email!.toLowerCase(), dateCreated : this.extensions.timeStamp(), firstName : this.firstName, lastName : this.lastName, searchName : this.firstName!.toLowerCase() + " " + this.lastName!.toLowerCase(), role : "user", stripeId : res["id"]}).then((_res : any) => {
            this.registering = false;
            this.displayMessage("Registration complete", "Dismiss");
          }).catch((_e: any) => {
            this.registering = false;
            this.displayError("Error Registering User", "Dismiss");
        });
      })
    });

  }

  displayError(message: string, action: string) {
    let m = this._snackBar.open(message, action, {
      duration: 5000,
    });

    m.onAction().subscribe(() => {
      this._snackBar.dismiss()
    });
  }

  displayMessage(message: string, action: string) {
    let m = this._snackBar.open(message, action, {
      duration: 5000,
    });

    m.onAction().subscribe(() => {
      this._snackBar.dismiss()
    });
  }

  openRegistrationDialog() {
    // this.dialog.open(this.registrationDialog, {
    //   width: '400px'
    // });
  }

  dismissDialog() {
    this.dialog.closeAll()
  }

  dismissRegistrationModal() {
    this.dialog.closeAll()
    this.router.navigate(["/main"] , { skipLocationChange: false });
  }

}
