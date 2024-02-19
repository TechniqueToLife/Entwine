import * as firebase from 'firebase/compat/app';

export class Category {

  id?: string;
  name?: string;
  description?: string;
  timeStamp?: string;
  lastUpdated? : string;
  parentCategory?: string;
  imageUrl?: string;
  viewCount?: number;
  productCount? : number;
  purchaseCount? : number;

  archived = false;

  document? : firebase.default.firestore.DocumentData;

  constructor(data : any = {}) {
    this.id = data["id"];
    this.name = data["name"];
    this.description = data["description"];
    this.timeStamp = data["timeStamp"];
    this.lastUpdated = data["lastUpdated"];
    this.parentCategory = data["parentCategory"];
    this.imageUrl = data["imageUrl"] ?? "/assets/default.jpg";
    this.viewCount = data["viewCount"] ?? 0;
    this.productCount = data["productCount"] ?? 0;
    this.purchaseCount = data["purchaseCount"] ?? 0;
    this.archived = data["archived"] ?? false;
  }
}

export class CategoryListItem {
  id?: string;
  name?: string;
  parentCategory?: string;
  archived = false;

  constructor(data : any = {}) {
    this.id = data["id"];
    this.name = data["name"];
    this.archived = data["archived"] ?? false;
    this.parentCategory = data["parentCategory"];
  }
}
