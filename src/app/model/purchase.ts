import * as firebase from 'firebase/compat/app';
import { Product } from '../model/product';
export class Purchase {

  name? : string;
  firstName? : string;
  lastName? : string;
  id? : string;
  userId? : string;
  chargeId? : string;
  invoiceId? : string;
  timeStamp? : string;
  total = 0.0;
  shippingTotal = 0.0;
  currency? : string;
  recurring = false;

  email? : string;

  items : string[] = [];
  variationData : string[] = [];

  trackingNumbers : string[] = [];
  document? : firebase.default.firestore.DocumentData;

  archived = false;
  refunded = false;
  status? : string;
  orderType? : string;

  constructor(input? : any) {
    if(!input) { return }
    this.id = input["id"];
    this.userId = input["userId"];
    this.email = input["email"];
    this.firstName = input["firstName"];
    this.lastName = input["lastName"];
    this.invoiceId = input["invoiceId"];
    this.chargeId = input["chargeId"];
    this.timeStamp = input["timeStamp"];
    this.status = input["status"];
    this.total = input["total"] ?? 0.0;
    this.shippingTotal = input["shippingTotal"] ?? 0.0;
    this.currency = input["currency"] ?? "$";
    this.recurring = input["recurring"] ?? false;
    this.archived = input["archived"] ?? false;
    this.refunded = input["refunded"] ?? false;
    this.items = input["items"] ?? [];
    this.variationData = input["variationData"] ?? this.items;
    this.trackingNumbers = input["trackingNumbers"] ?? [];
    this.orderType = input["orderType"];

    //copy to charge ID if the invoice is actually a charge
    //this is will be the case for non recurring products
    if(this.invoiceId!.startsWith("ch")) {
      this.chargeId = this.invoiceId;
      }
    }

}
