export class ShippingOption {

  //Based on Stripe shipping option Object
  id: string;
  label: string;
  detail: string;
  amount = 0;

  data = {};


  constructor(data : any = {}) {
    this.id = data["id"];
    this.label = data["label"];
    this.detail = data["detail"];
    this.amount = data["amount"];

    this.data = data;
  }

}
