import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { AngularFireAuthModule, AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';
import { UserConnect } from '../service/userconnect';
import { LoginService } from '../service/login.service';
import { Extensions } from '../helpers/extensions';
import { Globals } from '../helpers/globals';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { User } from '../model/user';
import { Product } from '../model/product';
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
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit, OnDestroy {
  currentUser? : User;
  databaseRef : AngularFirestore;

  task!: AngularFireUploadTask;

  fileUploadPercent?: Observable<number | undefined>;
  imageUploadPercent?: Observable<number | undefined>;
  snapshot!: Observable<any>;
  downloadURL!: string;

  categories : CategoryListItem[] = [];

  formattedRoleDescription = "";

  uploadingFile = false;

  submitting = false;

  copyMessage = "Copy";

  variation1OptionInput? : string;
  variation2OptionInput? : string;

  selectedVariationOption1? : string;
  selectedVariationOption2? : string;

  @ViewChild('quantitySetter') quantitySetterDialog?: TemplateRef<any>;


  formData = {
    name: '',
    id: '',
    digital: true,
    type : '',
    description: '',
    timeStamp: '',
    category: '',
    imageUrl: '',
    imageUrls: new Array(),
    fileUrl: '',
    mediaUrl: '',
    priceId: '',
    stripeProductId: '',
    price: 0.0,
    quantity: 0,
    viewCount: 0,
    purchaseCount: 0,
    uniqueUrl: true,
    lastUpdated : '',
    archived : false,
    searchName : '',
    featured : true,
    variationQuantities : {},
    variation1Name : '',
    variation2Name : '',
    variation1Options : new Array(),
    variation2Options : new Array(),
  }
  variationQuantities : any = {};
  productId : string;
  originalProduct? : Product;

  quantitySetterInput = 0;

  submitText = "Submit";

  private readonly newProperty = this;

  constructor(firestore: AngularFirestore, private router: Router,
      private route : ActivatedRoute, public extensions : Extensions, private userConnect : UserConnect,
  private login : LoginService, private globals : Globals, private _snackBar: MatSnackBar, private http: HttpClient, private storage: AngularFireStorage, private dialog : MatDialog, private clipboard: Clipboard) {
    this.productId = this.route.snapshot.params['id'];
    this.formData.id = this.route.snapshot.params['id'];
    this.databaseRef = firestore;
    this.login.updateInAdmin(true);
    this.formData.imageUrls = [];
    console.log(this.productId);
    this.login.currentUserObservable.subscribe(u => {
      this.currentUser = u;
  })
    if(!this.productId) {
      this.formData.id = firestore.collection("product").doc().ref.id;
      this.submitText = "Submit";
    } else {
      this.userConnect.fetchProduct(this.productId).then(p => {
        this.originalProduct = p;
        this.formData.name = p.name!;
        this.formData.id = p.id!;
        this.formData.type  = p.type!;
        this.formData.description = p.description!;
        this.formData.category = p.category!;
        this.formData.imageUrl = p.imageUrl!;
        this.formData.imageUrls = p.imageUrls!;
        this.formData.fileUrl = p.fileUrl!;
        this.formData.mediaUrl = p.mediaUrl!;
        this.formData.digital = p.digital!;
        this.formData.price = p.price!;
        this.formData.quantity = p.quantity!;
        this.formData.purchaseCount = p.purchaseCount!;
        this.formData.uniqueUrl = p.uniqueUrl;
        this.formData.stripeProductId = p.stripeProductId!;
        this.formData.priceId = p.priceId!;
        this.formData.archived = p.archived;
        this.formData.featured = p.featured;
        this.formData.variation1Name = p.variation1Name ?? '';
        this.formData.variation2Name = p.variation2Name ?? '';
        this.formData.variation1Options = p.variation1Options ?? [];
        this.formData.variation2Options = p.variation2Options ?? [];
        this.formData.variationQuantities = p.variationQuantities as any ?? {};
        this.variationQuantities = p.variationQuantities as any ?? {};
        console.log(p);
        this.submitText = "Update";
      })
    }
  }

  ngOnInit(): void {
    this.categories.push(new CategoryListItem({id : "", name : "No Category", archived : false}));
    this.userConnect.fetchAllCategoryNames(false).then(c => {this.categories = this.categories.concat(c)})
  }

  ngOnDestroy(): void {
    this.login.updateInAdmin(false);
  }

  evaluateSubmitStatus() {

  }


  uploadFile(event : any) {
    this.uploadingFile = true;
    let path = "product/" + this.formData.id + "/file";

    const ref = this.storage.ref(path);

    let task = this.storage.upload(path, event.target.files[0]);
    this.fileUploadPercent = task.percentageChanges();
    console.log("Start upload");
    let snapshot = task.snapshotChanges().pipe(
    finalize(() => {
      ref.getDownloadURL().subscribe((downloadURL : string) => {
        this.formData.fileUrl = downloadURL;

        this.uploadingFile = false;
        console.log("done");
        // this.databaseRef.collection('product').doc(this.formData.id).update( { profileImageUrl : downloadURL}).then(r => {
            this.displayMessage("File uploaded", "Dismiss");
            this.fileUploadPercent = undefined;
          // }).catch(e => {
          //   console.log(e);
          //   this.fileUploadPercent = undefined;
          // });


        });
      })
    ).subscribe();
  }


  uploadImage(event : any) {
    this.uploadingFile = true;
    for (var i = 0; i < event.target.files.length; i++) {

      let path = "product/" + this.formData.id + "/image" + [i + (Math.random() * 100)];

      const ref = this.storage.ref(path);

      let task = this.storage.upload(path, event.target.files[i]);
      this.imageUploadPercent = task.percentageChanges();
      console.log("Start upload");
      let snapshot = task.snapshotChanges().pipe(
      finalize(() => {
        ref.getDownloadURL().subscribe((downloadURL : string) => {
          this.formData.imageUrl = downloadURL;
          console.log(downloadURL);
          this.formData.imageUrls.push(downloadURL);
          console.log(i);

          this.uploadingFile = false;
          console.log("done");
          // this.databaseRef.collection('product').doc(this.formData.id).update( { profileImageUrl : downloadURL}).then(r => {
              this.displayMessage("Product image uploaded", "Dismiss");
              this.imageUploadPercent = undefined;
            // }).catch(e => {
            //   console.log(e);
            //   this.imageUploadPercent = undefined;
            // });


          });
        })
      ).subscribe();
    }
  }

  submit() {
    let price = Math.round(this.formData.price * 100);
    if(this.formData.timeStamp == '') {
      this.formData.timeStamp = this.extensions.timeStampWithSeconds();
    }
    this.formData.lastUpdated = this.extensions.timeStampWithSeconds();
    this.formData.searchName = this.formData.name.toLowerCase();
    this.formData.quantity = +this.formData.quantity;
    if(!this.productId) {

        this.http.post("https://romebeats.com/stripeapi/createproduct.php", "name="+this.formData.name+"&description="+this.formData.description+"&id="+this.formData.id+"&shippable="+!this.formData.digital+"&images="+this.formData.imageUrl+"&fileUrl="+this.formData.fileUrl, httpOptions).subscribe((res : any) => {
          console.log(res);
          if(res["error"]) {
            this.displayError("Error submitting product", "Dismiss");
            return
          }
          this.http.post("https://romebeats.com/stripeapi/createprice.php", "price="+price+"&currency="+"usd"+"&productId="+res["id"], httpOptions).subscribe((priceRes : any) => {
            if(priceRes["error"]) {
              this.displayError("Error submitting product", "Dismiss");
              return
            }
            this.formData.stripeProductId = res["id"];
            this.formData.priceId = priceRes["id"];
            this.databaseRef.collection('product').doc(this.formData.id).set( this.formData , { merge: true }).then(r => {
              this.displayMessage("Product listed", "Dismiss");

              if(this.formData.category != undefined && this.formData.category.length > 1) {
                this.databaseRef.collection('category').doc(this.formData.category).collection("items").doc(this.formData.id).set( {itemId : this.formData.id, timeStamp : this.formData.timeStamp, archived : this.formData.archived } , { merge: true }).then(r => {
                })
              }

            }).catch(e => {
              this.displayError("Error submitting product", "Dismiss");
          })
        })
      })

    } else {
      this.http.post("https://romebeats.com/stripeapi/updateproduct.php", "name="+this.formData.name+"&description="+this.formData.description+"&id="+this.formData.stripeProductId+"&shippable="+!this.formData.digital, httpOptions).subscribe((res : any) => {
        console.log(res);
        if(res["error"]) {
          this.displayError("Error updating product", "Dismiss");
          return
        }

        //Only update price if needed, since it create a new price object in Stripe. Since we can not update an existing price object
        if(this.originalProduct && this.originalProduct.price != this.formData.price) {

            this.http.post("https://romebeats.com/stripeapi/createprice.php", "price="+price+"&currency="+"usd"+"&productId="+this.formData.stripeProductId, httpOptions).subscribe((priceRes : any) => {
              if(priceRes["error"]) {
                this.displayError("Error updating product", "Dismiss");
                return
              }

              //Since we can not update a price object, create a new one
              this.formData.priceId = priceRes["id"];
              finalize();
            })

        } else {
          finalize()
        }
      })

      const finalize = () => {

                    this.databaseRef.collection('product').doc(this.formData.id).set( this.formData , { merge: true }).then(r => {
                    this.displayMessage("Product updated", "View item");

                    if(this.formData.category != undefined && this.formData.category.length > 1) {
                      this.databaseRef.collection('category').doc(this.formData.category).collection("items").doc(this.formData.id).set( {itemId : this.formData.id, timeStamp : this.formData.timeStamp, archived : this.formData.archived } , { merge: true }).then(r => {
                      })
                    }
                  }).catch(e => {
                    this.displayError("Error updating product", "Dismiss");
                    })
      }

    }
  }


  copyUrl() {
    let copied = this.clipboard.copy(this.formData.fileUrl);
    this.copyMessage = "Copied"
    setTimeout((u : any) => {
      this.copyMessage = "Copy"
    }, 3000)
  }

  deleteImage(url : string) {

  }

  enterVariationOption(forVariationList : number) {
    if(forVariationList == 1) {
      if(!this.variation1OptionInput || this.variation1OptionInput == "") { return }
      this.formData.variation1Options.push(this.variation1OptionInput);
      this.variation1OptionInput = undefined;
    }

    if(forVariationList == 2) {
      if(!this.variation2OptionInput || this.variation2OptionInput == "") { return }
      this.formData.variation2Options.push(this.variation2OptionInput);
      this.variation2OptionInput = undefined;
    }
  }

  deleteVariationOption(forVariationList : number, input : string) {
    if(forVariationList == 1) {
      this.formData.variation1Options.splice(this.formData.variation1Options.findIndex(o => o == input), 1);
    }

    if(forVariationList == 2) {
      this.formData.variation2Options.splice(this.formData.variation2Options.findIndex(o => o == input), 1);
    }
  }

  closeQuantitySetter() {
    this.dialog.closeAll();
  }

  openVariationQuantityView() {
    this.saveVariations();
    if(this.formData.variation1Options.length > 0) {
      this.selectedVariationOption1 = this.formData.variation1Options[0];
    }

    if(this.formData.variation2Options.length > 0) {
      this.selectedVariationOption2 = this.formData.variation2Options[0];
    }

    this.dialog.open(this.quantitySetterDialog!, {
      width: '500px'
    });
  }

  updateVariationQuantity() {
    this.formData.quantity = 0;
    let formDataVars = this.variationQuantities as Map<string, string>;
    console.log(formDataVars);
    Object.entries(formDataVars).forEach(v => {
      this.formData.quantity += +v[1];
    })
  }

  saveVariationQuantities() {

    // this.dialog.closeAll();
    console.log(this.formData.variationQuantities);
    let variationQuantities = {} as any;
    this.formData.variationQuantities = variationQuantities;
    
    this.updateVariationQuantity();

    let formDataVars = this.variationQuantities as Map<string, string>;
    for(let v of Object.entries(formDataVars)) {
      variationQuantities[v[0]] = +v[1];
    }
    this.databaseRef.firestore.collection("product").doc(this.formData.id).set({variationQuantities : variationQuantities}, {merge : true}).then(_ => {
      this.displayMessage("Quantities updated", "Dismiss");
      this.dialog.closeAll();
    }).catch(e => {
      this.displayError("Connection error", "Dismiss");
    })
  }

  saveVariations() {
    let newQuantities = {} as any;
    let formDataVars = this.variationQuantities as Map<string, string>;
    console.log(this.formData.variationQuantities);
    console.log(formDataVars);
    console.log("saving");
    if(this.formData.variation2Options.length != 0) {
      for(let o of this.formData.variation1Options as string[]) {
        for(let p of this.formData.variation2Options as string[]) {
          let originalQuantity = 0;
          let v = this.formData.variationQuantities as any;
          console.log(v);

          originalQuantity = v[o + "+" + p] ?? 0;

          newQuantities[o + "+" + p] =  "" + originalQuantity;
        }
      }
    } else {
      for(let o of this.formData.variation1Options as string[]) {
        let originalQuantity = 0;
        let v = this.formData.variationQuantities as any;
        console.log(v);

        originalQuantity = v[o] ?? 0;


        newQuantities[o] =  "" + originalQuantity;
        }
    }
    this.formData.variationQuantities = newQuantities;
    this.variationQuantities = newQuantities;
  }

  displayMessage(message: string, action: string) {
    let m = this._snackBar.open(message, action, {
      duration: 5000,
      panelClass: ['primary-backgroundcolor']
    });
    if(action == "View item") {

      m.onAction().subscribe(() => {
        this.router.navigate(['/p/' + this.productId] , { skipLocationChange: false });
      });
    } else {

      m.onAction().subscribe(() => {
        m.dismiss()
      });
    }
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
