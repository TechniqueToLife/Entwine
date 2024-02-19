import * as firebase from 'firebase/compat/app';

export class Product {

  id?: string;
  name?: string;
  type?: string;
  description?: string;
  timeStamp?: string;
  category?: string;
  imageUrl?: string;
  imageUrls?: [];
  mediaUrl?: string;
  priceId?: string;
  stripeProductId?: string;
  price?: number;
  quantity?: number;
  cartQuantity?: number;

  //Use cart Ids because we can not use the item id in a cart because of item variations
  cartId?: string;
  selectedVariation?: string;

  viewCount?: number;
  purchaseCount?: number;


  variation1Name? : string;
  variation2Name? : string;
  variation1Options? : string[];
  variation2Options? : string[];
  variationQuantities? : {};

  fileUrl?: string;
  uniqueUrl = false;
  digital = true;

  inCart = false;
  currency?: string;

  carrier?: string;
  trackingNumber?: string;

  featured = false;

  archived = false;

  selected = false;

  document? : firebase.default.firestore.DocumentData;

  cartNote? : string;

  constructor(data : any = {}) {
    this.id = data["id"];
    this.name = data["name"];
    this.type = data["type"];
    this.description = data["description"];
    this.timeStamp = data["timeStamp"];
    this.category = data["category"];
    this.imageUrl = data["imageUrl"] ?? "/assets/default.jpg";
    this.imageUrls = data["imageUrls"] ?? [];
    this.mediaUrl = data["mediaUrl"];
    this.priceId = data["priceId"];
    this.stripeProductId = data["stripeProductId"];
    this.price = data["price"] ?? 0;
    this.quantity = data["quantity"] ?? 0;
    this.viewCount = data["viewCount"] ?? 0;
    this.purchaseCount = data["purchaseCount"] ?? 0;
    this.fileUrl = data["fileUrl"];
    this.uniqueUrl = data["uniqueUrl"] ?? false;
    this.archived = data["archived"] ?? false;
    this.digital = data["digital"] ?? true;
    this.cartQuantity = data["cartQuantity"] ?? 1;
    this.featured = data["featured"] ?? false;
    this.variationQuantities = data["variationQuantities"];
    this.variation1Name = data["variation1Name"];
    this.variation2Name = data["variation2Name"];
    this.variation1Options = data["variation1Options"] ?? [];
    this.variation2Options = data["variation2Options"] ?? [];
    this.selectedVariation = data["selectedVariation"];
    this.cartId = data["cartId"];



    this.carrier = data["carrier"];
    this.trackingNumber = data["trackingNumber"];
  }
}
