import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit } from '@angular/core';
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
import { Category, CategoryListItem } from '../model/category';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatDateFormats, MAT_NATIVE_DATE_FORMATS, MAT_DATE_FORMATS } from '@angular/material/core';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { Router, ActivatedRoute, RouterStateSnapshot, RouterEvent } from '@angular/router';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  })
};

@Component({
  selector: 'app-categoryadmin',
  templateUrl: './categoryadmin.component.html',
  styleUrls: ['./categoryadmin.component.css']
})
export class CategoryadminComponent implements OnInit, OnDestroy {
  currentUser? : User;
  databaseRef : AngularFirestore;

  task!: AngularFireUploadTask;

  categories : Category[] = [];

  fileUploadPercent?: Observable<number | undefined>;
  imageUploadPercent?: Observable<number | undefined>;
  snapshot!: Observable<any>;
  downloadURL!: string;

  formattedRoleDescription = "";

  uploadingFile = false;

  submitting = false;

  copyMessage = "Copy";

  formData = {
    id: "",
    name: "",
    description: "",
    timeStamp: "",
    lastUpdated: "",
    parentCategory: "",
    imageUrl: "",
    viewCount: 0,
    productCount: 0,
    purchaseCount: 0,
    searchName : "",
    archived : false
  }

  categoryId : string;

  submitText = "Create";

  constructor(firestore: AngularFirestore, private router: Router,
      private route : ActivatedRoute, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private globals : Globals, private _snackBar: MatSnackBar, private http: HttpClient, private storage: AngularFireStorage, private dialog : MatDialog, private clipboard: Clipboard) {
    this.categoryId = this.route.snapshot.params['id'];
    this.formData.id = this.route.snapshot.params['id'];
    this.databaseRef = firestore;
    this.login.updateInAdmin(true);
    console.log(this.categoryId);
    this.login.currentUserObservable.subscribe(u => {
      this.currentUser = u;
  });
    if(!this.categoryId) {
      this.formData.id = firestore.collection("categories").doc().ref.id;
      this.submitText = "Create";
      this.fetchCategoryNames();
    } else {
      this.userConnect.fetchCategory(this.categoryId).then(p => {
        this.formData.id = p.id!;
        this.formData.name = p.name!;
        this.formData.description = p.description!,
        this.formData.timeStamp = p.timeStamp!,
        this.formData.lastUpdated = p.lastUpdated?? "",
        this.formData.parentCategory = p.parentCategory ?? "",
        this.formData.imageUrl = p.imageUrl!;
        this.formData.viewCount = p.viewCount ?? 0,
        this.formData.productCount = p.productCount ?? 0,
        this.formData.purchaseCount = p.purchaseCount ?? 0;
        this.formData.archived = p.archived;


        this.submitText = "Update";

        this.fetchCategoryNames();
      })
    }
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {
    this.login.updateInAdmin(false);
  }

  fetchCategoryNames() {
    this.categories.push(new Category({id : "", name : "No Category", archived : false}));
      this.userConnect.fetchCategories().then(c => {
        for (let cc of c) {
          console.log(cc);
          console.log("HI");
          console.log(this.formData.id);
        if(cc.id != this.formData.id && (!cc.parentCategory || cc.parentCategory.length == 0)) {
          this.categories.push(cc);
        } else {
          console.log("dont add");
        }
      }
    })
  }

  evaluateSubmitStatus() {

  }



    uploadImage(event : any) {
      this.uploadingFile = true;
      let path = "category/" + this.formData.id + "/image";

      const ref = this.storage.ref(path);

      let task = this.storage.upload(path, event.target.files[0]);
      this.imageUploadPercent = task.percentageChanges();
      console.log("Start upload");
      let profileImageSnapshot = task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL().subscribe((downloadURL : string) => {
          this.formData.imageUrl = downloadURL;

          this.uploadingFile = false;
          console.log("done");
          // this.databaseRef.collection('category').doc(this.formData.id).update( { profileImageUrl : downloadURL}).then(r => {
              this.displayMessage("category image uploaded", "Dismiss");
              this.imageUploadPercent = undefined;
            // }).catch(e => {
            //   console.log(e);
            //   this.imageUploadPercent = undefined;
            // });


          });
        })
      ).subscribe();
    }

    submit() {
      if(this.formData.timeStamp == '') {
        this.formData.timeStamp = this.extensions.timeStampWithSeconds();
      }
      this.formData.lastUpdated = this.extensions.timeStampWithSeconds();
      this.formData.searchName = this.formData.name.toLowerCase();
      let u = this.formData.id;
      let batch = this.databaseRef.firestore.batch();
      // const union = firebase.default.firestore.FieldValue.arrayUnion(this.formData.id + ":" + this.formData.name + ":" + this.formData.archived);
      batch.set(this.databaseRef.firestore.collection('category').doc("allCategories"), {categories : {[`${u}`] : this.formData.name + ":" + this.formData.archived}}, { merge: true });

      batch.set(this.databaseRef.firestore.collection('category').doc(this.formData.id), this.formData, { merge: true });
      batch.commit().then(r => {
        this.displayMessage(this.categoryId ? "Category updated" : "Category listed", "Dismiss");
        }).catch(e => {
          this.displayError("Error submitting category", "Dismiss");
      })
    }


    copyUrl() {
      let copied = this.clipboard.copy(this.formData.imageUrl);
      this.copyMessage = "Copied"
      setTimeout((u : any) => {
        this.copyMessage = "Copy"
      }, 3000)
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
