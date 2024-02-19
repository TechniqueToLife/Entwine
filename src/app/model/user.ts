import * as firebase from 'firebase/compat/app';

export class User {

  userId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  dateJoined?: string;
  profileImageUrl?: string;
  role?: string;
  lastActive?: string;
  stripeId?: string;
  membershipActive?: string;
  subscriptionId?: string;
  document? : firebase.default.firestore.DocumentData;


  constructor(data : any = {}) {
    this.userId = data["userId"];
    this.email = data["email"];
    this.firstName = data["firstName"];
    this.lastName = data["lastName"];
    this.dateJoined = data["dateJoined"];
    this.profileImageUrl = data["profileImageUrl"] ?? "/assets/default.jpg";
    this.role = data["role"] ?? "user";
    this.lastActive = data["lastActive"];
    this.stripeId = data["stripeId"];
    this.membershipActive = data["membershipActive"] ?? false;
    this.subscriptionId = data["subscriptionId"];

  }
}
