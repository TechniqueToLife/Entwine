import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../model/product';
import { Purchase } from '../model/purchase';
import { User } from '../model/user';
import { UserConnect } from '../service/userconnect';

@Injectable()
export class LoginService {

  private userIdSource = new BehaviorSubject<string>("");
  private inAdminSource = new BehaviorSubject<boolean>(false);
  private viewBagSource = new BehaviorSubject<boolean>(false);
  private bagBadgeSource = new BehaviorSubject<number>(0);


  private bagSource = new BehaviorSubject<Product[]>([]);
  bagObservable = this.bagSource.asObservable();
  bagBadgeObservable = this.bagBadgeSource.asObservable();

  private cartPreviewItemSource = new BehaviorSubject<Product | undefined>(undefined);
  cartPreviewItemObservable = this.cartPreviewItemSource.asObservable();


  currentUserIdObservable = this.userIdSource.asObservable();
  inAdminObservable = this.inAdminSource.asObservable();
  displayingBagObservable = this.viewBagSource.asObservable();
  private purchaseSource = new BehaviorSubject<string>("");
  purchaseObservable = this.purchaseSource.asObservable();


  private uploadErrorSource = new BehaviorSubject<boolean>(false);
  uploadErrorObservable = this.uploadErrorSource.asObservable();

  private currentUserSource = new BehaviorSubject<User>(new User({}));
  currentUserObservable = this.currentUserSource.asObservable();

  private emailVerificationSource = new BehaviorSubject<string>("");
  emailVerificationObservable = this.emailVerificationSource.asObservable();

  private hideSource = new BehaviorSubject<boolean>(false);
  hideObservable = this.hideSource.asObservable();

  currentUserId?: string;
  currentUser?: User;



  activeComponent? : string;

  constructor(private userConnect : UserConnect) { }



  updateCurrentUserId(userId? : string) {
    this.currentUserId = userId;
    console.log("updated current user id");
    console.log(userId);
    if(!userId || userId.length == 0) {
      this.currentUser = undefined;
      console.log("currentUserSource is now null");
      return
    }

    this.userConnect.fetchUserFromId(userId).then(returnedUser => {
      this.currentUser = returnedUser;
      console.log("updated current user");
      this.currentUserSource.next(returnedUser);
    });
    this.userIdSource.next(userId);
  }

  updateEmailVerification(userId : string) {
    this.emailVerificationSource.next(userId);
  }

  updateInAdmin(inAdmin : boolean) {
    this.inAdminSource.next(inAdmin);
  }


  viewBag(view : boolean) {
    this.viewBagSource.next(view);
  }


  toggleViewBag() {
    this.viewBagSource.next(!this.viewBagSource.getValue());
  }


  updatePurchaseId(p : string) {
    this.purchaseSource.next(p);
  }

  updateBag(products : Product[]) {
    this.bagSource.next(products);
    localStorage.setItem('cart', JSON.stringify(products));

    let count = 0;
    for(let p of products) {
      count += p.cartQuantity ?? 1;
    }
    this.bagBadgeSource.next(count);
  }

  showCartPreview(product : Product) {
    this.cartPreviewItemSource.next(product);
  }

  updateQuantityForBagItem(product : Product) {

  }

  hide(hide : boolean) {
    this.hideSource.next(hide);
  }

  uploadImageError() {
    this.uploadErrorSource.next(true);
    setTimeout(() => {
      this.uploadErrorSource.next(false);
    }, 20)
  }

}
