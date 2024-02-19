import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CreateComponent } from './create/create.component';
import { ProductComponent } from './product/product.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { PaymentcompleteComponent } from './paymentcomplete/paymentcomplete.component';
import { ProductlistComponent } from './productlist/productlist.component';
import { CategoryComponent } from './category/category.component';
import { CategorylistComponent } from './categorylist/categorylist.component';
import { CategoryadminComponent } from './categoryadmin/categoryadmin.component';
import { UserlistComponent } from './userlist/userlist.component';
import { UserComponent } from './user/user.component';
import { OrderlistComponent } from './orderlist/orderlist.component';
import { OrderComponent } from './order/order.component';
import { OrderadminComponent } from './orderadmin/orderadmin.component';
import { OrderlookupComponent } from './orderlookup/orderlookup.component';
import { ShippingAdminComponent } from './shipping-admin/shipping-admin.component';

const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'create/:id', component: CreateComponent },
  { path: 'create', component: CreateComponent },
  { path: 'p/:id', component: ProductComponent},
  { path: 'admin', component: AdminHomeComponent},
  { path: 'cart', component: CartComponent},
  { path: 'checkout', component: CheckoutComponent},
  { path: 'paymentcomplete', component: PaymentcompleteComponent},
  { path: 'pl', component: ProductlistComponent},
  { path: 'c/:id', component: CategoryComponent},
  { path: 'cl', component: CategorylistComponent},
  { path: 'categoryadmin', component: CategoryadminComponent},
  { path: 'categoryadmin/:id', component: CategoryadminComponent},
  { path: 'ul', component: UserlistComponent},
  { path: 'u/:id', component: UserComponent},
  { path: 'ol', component: OrderlistComponent},
  { path: 'o/:id', component: OrderComponent},
  { path: 'orderadmin/:id', component: OrderadminComponent},
  { path: 'orderlookup', component: OrderlookupComponent},
  { path: 'sa', component: ShippingAdminComponent},

]

@NgModule({
  imports: [
      RouterModule.forRoot(routes, {
        scrollPositionRestoration: 'top'
  })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
