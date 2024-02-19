export class Card {

  //Use payment method id for subscriptions
  id : string;

  //Use card id for regular purchases. We are making a regular charge with the card id
  cardId? : string;

  last4 : string;
  brand : string;
  expiration : string;


  constructor(data : any = {}) {
    this.id = data["id"];
    this.expiration = data["card"]["exp_month"] + "/" + data["card"]["exp_year"];
    // this.cardId = data["card"]["id"];
    this.brand = data["card"]["brand"];
    this.last4 = data["card"]["last4"];
  }

}
