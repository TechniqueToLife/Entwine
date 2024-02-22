import { Injectable } from '@angular/core';
import { NgModule } from '@angular/core';
import { Location } from "@angular/common";
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/compat/firestore/';
import { FirestoreModule } from '@angular/fire/firestore';
import { Extensions } from '../helpers/extensions';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import * as firebase from 'firebase/compat/app';

import { take, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Product } from '../model/product';
import { Category, CategoryListItem } from '../model/category';
import { Purchase } from '../model/purchase';
import { ShippingOption } from '../model/stripeshippingoption';

@Injectable()
@NgModule()
export class UserConnect {

  databaseRef : AngularFirestore;

  activeComponent!: string;

  constructor(db: AngularFirestore, private extensions : Extensions, private location: Location, private router: Router) {
    this.databaseRef = db;


    router.events.subscribe(val => {
        this.activeComponent = location.path(false);
    });
  }

  fetchUserFromId(id: string) : Promise<User> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          let userDataRef = this.databaseRef.firestore.collection('users').doc(id);
          userDataRef.get().then((res : any) => {
            let data = res.data();

            let user = new User(data);

            resolve(user);
            });

      }, 0); //for timeout
    });
  }

  updateUser(userId : string, data : {}) : Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let userRef = this.databaseRef.firestore.collection('users').doc(userId);
        userRef.set(data, { merge: true }).then((res : any) => {
          resolve(true);
        }).catch((e : any) => {
          reject(false);
        });
      }, 0);
    });
  }

  addToCart(userId : string, productId : string, quantity : number = 1, selectedVariation? : string, bagId? : string) : Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let userRef = this.databaseRef.collection("bag").doc(userId);
        if(bagId) {
          console.log(bagId + "BAG ID")
          userRef = userRef.collection("bag").doc(bagId);
        } else {
          console.log("NO BAG ID")
          userRef = userRef.collection("bag").doc();
        }

          userRef.set({"id" : productId, "quantity" : quantity, timeStamp : this.extensions.timeStamp(), "selectedVariation" : selectedVariation ?? null, "cartId" : bagId ?? null}, { merge: true }).then((res : any) => {
              resolve(true);
            }).catch((e : any) => {
              reject(false);
            });

      }, 0);
    });
  }

  removeFromCart(userId : string, productId : string) : Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let userRef = this.databaseRef.collection('bag').doc(userId).collection("bag").doc(productId);

          userRef.delete().then((res : any) => {
              resolve(true);
            }).catch((e : any) => {
              reject(false);
            });

      }, 0);
    });
  }

  fetchShippingOptions() : Promise<ShippingOption[]> {
    return new Promise((resolve, reject) => {
      let shippingOptions : ShippingOption[] = [];
      setTimeout(() => {
          let shippingOptionsRef = this.databaseRef.firestore.collection('shippingOptions');
          shippingOptionsRef.get().then((snapshot : any) => {
            snapshot.forEach((a : any) => {
              shippingOptions.push(new ShippingOption(a.data()));
            });
            resolve(shippingOptions);
          }).catch((e : any) => {
            console.log(e);
          });
      }, 0); //for timeout
    });
  }

  addShippingOption(shippingOption : ShippingOption) : Promise<string> {
    return new Promise((resolve, reject) => {
      let shippingOptions : ShippingOption[] = [];
      setTimeout(() => {
          let shippingOptionsRef = this.databaseRef.firestore.collection('shippingOptions').doc(shippingOption.id.toLowerCase());
          shippingOptionsRef.set({id : shippingOption.id.toLowerCase(), label : shippingOption.label, amount : shippingOption.amount, detail : shippingOption.detail}, { merge: true }).then((_ : any) => {
            resolve(shippingOptionsRef.id);
          }).catch((e : any) => {
            console.log(e);
            reject(e);

          });
      }, 0); //for timeout
    });
  }

  fetchBag(userId : string) : Promise<Product[]> {
    return new Promise((resolve, reject) => {
      let products : Product[] = [];
      setTimeout(() => {
          this.databaseRef.firestore.collection('bag').doc(userId).collection("bag").orderBy("timeStamp", "desc").get().then((snapshot : any) => {
            snapshot.forEach((a : any) => {
              let data = a.data();
              data["cartId"] = a.id;
              data["cartQuantity"] = data["quantity"];
              products.push(new Product(data));
            });
            resolve(products);
          }).catch((e : any) => {
            console.log(e);
          });
      }, 0); //for timeout
    });
  }

  fetchProduct(id : string) : Promise<Product> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          this.databaseRef.firestore.collection('product').doc(id).get().then((snapshot : any) => {
            resolve(new Product(snapshot.data()));
          });
      }, 0);
    });
  }

  fetchCategory(id : string) : Promise<Category> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          this.databaseRef.firestore.collection('category').doc(id).get().then((snapshot : any) => {
            resolve(new Category(snapshot.data()));
          });
      }, 0);
    });
  }

  fetchOrder(id : string) : Promise<Purchase> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          this.databaseRef.firestore.collection('orders').doc(id).get().then((s : any) => {
            resolve(new Purchase(s.data()));
          });
      }, 0);
    });
  }

  fetchAllCategoryNames(inlucdeArchived : boolean = false) : Promise<CategoryListItem[]> {
    let categories : CategoryListItem[] = [];
    return new Promise((resolve, reject) => {
      setTimeout(() => {
          this.databaseRef.firestore.collection('category').doc("allCategories").get().then((snapshot : any) => {
            let data = snapshot.data();
            for (const [key, value] of Object.entries(data!["categories"])) {
              let id = key;
              let sValue = String(value);
              let name = sValue.split(":")[0];
              let archived = sValue.split(":")[1];
              categories.push(new CategoryListItem({id : id, name : name, archived : archived}))
            }

            resolve(categories);
          });
      }, 0);
    });
  }

  fixProduct() {
    // let providerRef = this.databaseRef.firestore.collection('product');
    // providerRef.get().then((snapshot : any) => {
    //   let batch = this.databaseRef.firestore.batch();
    //
    //   snapshot.forEach((doc : any) => {
    //     batch.update(doc.ref, {searchName : doc.data()["name"].toLowerCase()})
    //   });
    //   batch.commit().then((u : any) => {
    //     console.log("done");
    //   });
    // });
  }

  fetchProducts(limit : number, requiredTrueFields? : string[], startWith? : Product, endWith? : Product, searchName? : string, categoryIds? : string[]) : Promise<Product[]> {
    return new Promise((resolve, reject) => {
      let providers : Product[] = [];
      setTimeout(() => {
          let productsRef = this.databaseRef.firestore.collection('product').orderBy("searchName", "asc");
          if(searchName) {
            console.log("Use search name");
            productsRef = productsRef.where("searchName", "<=", searchName.toLowerCase()+"\u{f8ff}").where("searchName", ">=", searchName.toLowerCase());
          }

          if(categoryIds) {
            console.log(categoryIds);
            productsRef = productsRef.where("category", "in", categoryIds);
          }

          if(requiredTrueFields) {
            for(let r of requiredTrueFields) {
              productsRef = productsRef.where(r, '==', true);
            }
          }


          if(startWith && startWith.document) {
            console.log("start with");
            productsRef = productsRef.startAfter(startWith.document).limit(limit)
          }

          if(endWith && endWith.document) {
            console.log("end with");
            productsRef = productsRef.endBefore(endWith.document).limitToLast(limit)
          }

          if(!startWith && !endWith) {
            productsRef = productsRef.limit(limit);
          }

          productsRef.get().then((snapshot : any) => {
            console.log(snapshot.docs.length);
            snapshot.forEach((doc : any) => {
              console.log("got product " + doc.id)
              let p = new Product(doc.data());
              p.document = doc;
              p.id = doc.id;
              providers.push(p)
            });
            resolve(providers);
          }).catch((e : any) => {
            reject(e);
            console.log(e);
          });
      }, 0); //for timeout
    });
  }


  fetchCategories(limit? : number, requiredTrueFields? : string[], startWith? : Category, endWith? : Category, searchName? : string, parentCategory? : string) : Promise<Category[]> {
    return new Promise((resolve, reject) => {
      let providers : Category[] = [];
      setTimeout(() => {
          let categoriesRef = this.databaseRef.firestore.collection('category').orderBy("searchName", "asc");
          if(searchName) {
            console.log("Use search name");
            categoriesRef = categoriesRef.where("searchName", "<=", searchName.toLowerCase()+"\u{f8ff}").where("searchName", ">=", searchName.toLowerCase());

          }
          if(requiredTrueFields) {
            for(let r of requiredTrueFields) {
              categoriesRef = categoriesRef.where(r, '==', true)
            }
          }

          if(parentCategory && parentCategory.length > 0) {
            console.log("input parent category");
            categoriesRef = categoriesRef.where("parentCategory", "==", parentCategory);
          } else if(parentCategory == "") {
            console.log("search for top level categories");
            categoriesRef = categoriesRef.where("parentCategory", "==", "");
          } else {
            console.log("HUH");
          }

          if(startWith && startWith.document) {
            console.log("start with");
            categoriesRef = categoriesRef.startAfter(startWith.document);
            if(limit) {
              categoriesRef = categoriesRef.limit(limit);
            }
          }

          if(endWith && endWith.document) {
            console.log("end with");
            categoriesRef = categoriesRef.endBefore(endWith.document);
            if(limit) {
              categoriesRef = categoriesRef.limit(limit);
            }
          }

          if(!startWith && !endWith) {
            if(limit) {
              categoriesRef = categoriesRef.limit(limit);
            }
          }


          categoriesRef.get().then((snapshot : any) => {
            console.log(snapshot.docs.length);
            snapshot.forEach((doc : any) => {
              console.log("got category " + doc.id)
              let p = new Category(doc.data());
              p.document = doc;
              p.id = doc.id;
              providers.push(p)
            });
            resolve(providers);
          }).catch((e : any) => {
            reject(e);
          });
      }, 0); //for timeout
    });
  }

  fetchAllProduct(limit : number = 10, featured : boolean = false, includeArchived : boolean = true , startFrom? : firebase.default.firestore.DocumentData) : Promise<Product[]> {
    return new Promise((resolve, reject) => {
      let products : Product[] = [];
      setTimeout(() => {
          let productRef = this.databaseRef.firestore.collection('product').orderBy("timeStamp", "desc");
          if(featured) {
            productRef = productRef.where("featured" , "==", true)
          }

          if(!includeArchived) {
            productRef = productRef.where("archived" , "==", false);
            console.log("Exclude archived");
          }

          if(startFrom) {
            productRef = productRef.startAfter(startFrom);
          }
          productRef = productRef.limit(limit);
          productRef.get().then((snapshot : any) => {
            snapshot.docs.forEach((doc : any) => {
              let p = new Product(doc.data());
              p.document = doc;
              products.push(p);
            });
            resolve(products);
          });
      }, 0);
    });
  }


  clearCart(userId : string) : Promise<Boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.databaseRef.firestore.collection("bag").doc(userId).collection("bag").get().then((snapshot : any) => {
          let batch = this.databaseRef.firestore.batch();
          for(let d of snapshot.docs) {
            batch.delete(d.ref);
          }
          batch.commit().then((res : any) => {
            resolve(true)
          }).catch((e : any) => {
            reject(false);
          })
        });

      }, 0);
    });
  }


  addToPurchaseHistory(email : string, total : number, invoiceId : string, currency : string, products : Product[], orderId : string, firstName : string, lastName : string, orderType : string, userId? : string, shippingData? : {}, shipmentOption? : string, paymentMethod? : string, shippingTotal? : number) : Promise<string> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let ref = this.databaseRef.firestore.collection('purchaseHistory').doc(email).collection('purchaseHistory').doc(orderId);
        let orderRef = this.databaseRef.firestore.collection('orders').doc(orderId);
        let batch = this.databaseRef.firestore.batch();
        let purchaseIds : string[] = [];
        let variationData : string[] = [];
        for(let p of products) {
          purchaseIds.push(p.id!);
          console.log(p);
          variationData.push(p.selectedVariation && p.selectedVariation.length > 0 ? p.cartQuantity + ":" + p.id! + ":" + p.selectedVariation! : p.cartQuantity + ":" + p.id!);
        }

        let data = {id : ref.id, 'total' : total, 'invoiceId' : invoiceId, items : purchaseIds, variationData : variationData, 'currency' : currency, timeStamp : this.extensions.timeStampWithSeconds(), email : email, status : "paid", firstName : firstName, lastName : lastName, orderType : orderType, userId : userId ?? null,
        shippingData : shippingData ?? null, shipmentOption : shipmentOption ?? null, paymentMethod : paymentMethod ?? null , shippingTotal : shippingTotal ?? 0}

        batch.set(ref, data);
        batch.set(orderRef, data);
        batch.commit().then((res : any) => {
          resolve(ref.id);
        }).catch((e : any) => {
          reject(null);
        });
      }, 0);
    });
  }

  fetchPurchaseHistory(userId : string) : Promise<Purchase[]> {
    let r : Purchase[] = [];
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.databaseRef.firestore.collection('purchaseHistory').doc(userId).collection('purchaseHistory').get().then((snapshot : any) => {
          snapshot.forEach((item : any) => {
            let data = item.data();
            r.push(new Purchase(data));
          });
          resolve(r);
        });
      }, 0); //for timeout
    });
  }

  fetchOrders(limit : number, startWith? : Purchase, endWith? : Purchase, searchName? : string) : Promise<Purchase[]> {
    return new Promise((resolve, reject) => {
      let providers : Purchase[] = [];
      setTimeout(() => {
          let orderRef = this.databaseRef.firestore.collection('orders').orderBy("timeStamp", "desc");

          if(searchName) {
            orderRef = orderRef.where("email", "==", searchName)
          }

          if(startWith && startWith.document) {
            console.log("start with");
            orderRef = orderRef.startAfter(startWith.document).limit(limit)
          }

          if(endWith && endWith.document) {
            console.log("end with");
            orderRef = orderRef.endBefore(endWith.document).limitToLast(limit)
          }

          if(!startWith && !endWith) {
            orderRef = orderRef.limit(limit);
          }

          orderRef.get().then((snapshot : any) => {
            console.log(snapshot.docs.length);
            snapshot.forEach((doc : any) => {
              console.log("got product " + doc.id)
              let p = new Purchase(doc.data());
              p.document = doc;
              p.id = doc.id;
              providers.push(p)
            });
            resolve(providers);
          }).catch((e : any) => {
            reject(e);
          });
      }, 0); //for timeout
    });
  }

  fetchUsers(limit : number, startWith? : User, endWith? : User, searchEmail? : string) : Promise<User[]> {
    return new Promise((resolve, reject) => {
      let providers : User[] = [];
      setTimeout(() => {
          let usersRef : firebase.default.firestore.Query;

          usersRef = this.databaseRef.firestore.collection('users').orderBy("dateCreated", "desc");
          if(searchEmail) {
            console.log("Use search name");
            usersRef = this.databaseRef.firestore.collection('users').orderBy("email", "asc");
            usersRef = usersRef.where("email", "<=", searchEmail.toLowerCase()+"\u{f8ff}").where("email", ">=", searchEmail.toLowerCase());
          }
          if(startWith && startWith.document) {
            console.log("start with");
            usersRef = usersRef.startAfter(startWith.document).limit(limit)
          }

          if(endWith && endWith.document) {
            console.log("end with");
            usersRef = usersRef.endBefore(endWith.document).limitToLast(limit)
          }

          if(!startWith && !endWith) {
            usersRef = usersRef.limit(limit);
          }

          usersRef.get().then((snapshot : any) => {
            console.log(snapshot.docs.length);
            snapshot.forEach((doc : any) => {
              console.log("got product " + doc.id)
              let p = new User(doc.data());
              p.document = doc;
              p.userId = doc.id;
              providers.push(p)
            });
            resolve(providers);
          }).catch((e : any) => {
            reject(e);
          });
      }, 0); //for timeout
    });
  }
}
