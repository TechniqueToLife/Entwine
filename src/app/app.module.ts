import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';
import { UserConnect } from './service/userconnect';
import { LoginService } from './service/login.service';
import { Extensions } from './helpers/extensions';
import { Globals } from './helpers/globals';
import { FormsModule, ReactiveFormsModule, NgControl } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { CartComponent } from './cart/cart.component';
import { CategoryComponent } from './category/category.component';
import { CategoryadminComponent } from './categoryadmin/categoryadmin.component';
import { CategorylistComponent } from './categorylist/categorylist.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CreateComponent } from './create/create.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { NavigationComponent } from './navigation/navigation.component';
import { OrderComponent } from './order/order.component';
import { OrderadminComponent } from './orderadmin/orderadmin.component';
import { OrderlistComponent } from './orderlist/orderlist.component';
import { OrderlookupComponent } from './orderlookup/orderlookup.component';
import { PaymentcompleteComponent } from './paymentcomplete/paymentcomplete.component';
import { ProductComponent } from './product/product.component';
import { ProductlistComponent } from './productlist/productlist.component';
import { RegisterComponent } from './register/register.component';
import { UserComponent } from './user/user.component';
import { UserlistComponent } from './userlist/userlist.component';
import { ShippingAdminComponent } from './shipping-admin/shipping-admin.component';
import { initializeApp,provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAnalytics,getAnalytics,ScreenTrackingService,UserTrackingService } from '@angular/fire/analytics';
import { provideAuth,getAuth } from '@angular/fire/auth';
import { provideDatabase,getDatabase } from '@angular/fire/database';
import { provideFirestore,getFirestore } from '@angular/fire/firestore';
import { provideFunctions,getFunctions } from '@angular/fire/functions';
import { provideMessaging,getMessaging } from '@angular/fire/messaging';
import { providePerformance,getPerformance } from '@angular/fire/performance';
import { provideRemoteConfig,getRemoteConfig } from '@angular/fire/remote-config';
import { provideStorage,getStorage } from '@angular/fire/storage';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';


//Angular Material Components
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';
import {MatSliderModule} from '@angular/material/slider';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatMenuModule} from '@angular/material/menu';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTabsModule} from '@angular/material/tabs';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatPaginatorModule} from '@angular/material/paginator';
import { MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { HttpClientModule } from '@angular/common/http';
import { AngularFireModule } from '@angular/fire/compat';
import { CartPreviewComponent } from './cart-preview/cart-preview.component';
import { CartpreviewbottomsheetComponent } from './cartpreviewbottomsheet/cartpreviewbottomsheet.component';

@NgModule({
  declarations: [
    AppComponent,
    AdminHomeComponent,
    AdminSidebarComponent,
    CartComponent,
    CategoryComponent,
    CategoryadminComponent,
    CategorylistComponent,
    CheckoutComponent,
    CreateComponent,
    FooterComponent,
    LoginComponent,
    MainComponent,
    NavigationComponent,
    OrderComponent,
    OrderadminComponent,
    OrderlistComponent,
    OrderlookupComponent,
    PaymentcompleteComponent,
    ProductComponent,
    ProductlistComponent,
    RegisterComponent,
    UserComponent,
    UserlistComponent,
    ShippingAdminComponent,
    CartPreviewComponent,
    CartpreviewbottomsheetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideMessaging(() => getMessaging()),
    providePerformance(() => getPerformance()),
    provideRemoteConfig(() => getRemoteConfig()),
    provideStorage(() => getStorage()),
    NoopAnimationsModule,
    BrowserAnimationsModule,
    UserConnect,
    Extensions,
    Globals,
    HttpClientModule,
    FormsModule,
    MatSliderModule,
    BrowserAnimationsModule,
    MatCheckboxModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    // MatNativeDateModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatBottomSheetModule
  ],
  providers: [
    ScreenTrackingService,UserTrackingService, LoginService, Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
