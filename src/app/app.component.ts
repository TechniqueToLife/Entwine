import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { LoginService } from './service/login.service';
import { Auth } from '@angular/fire/auth';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSidenavModule } from '@angular/material/sidenav';
import { CartPreviewComponent } from './cart-preview/cart-preview.component';
import { Product } from './model/product';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { CartpreviewbottomsheetComponent } from './cartpreviewbottomsheet/cartpreviewbottomsheet.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'rome';
  adminView = false;

  mobileQuery: MediaQueryList;
  showCartPreview = false;
  private _mobileQueryListener: () => void;

  cartPreviewItem! : Product;
  constructor(
    public auth: Auth, private http: HttpClient, public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef, private login : LoginService, private media: MediaMatcher, private bottomSheet: MatBottomSheet, private cartPreviewModule : MatSidenavModule,
    private router : Router) {


      this.mobileQuery = media.matchMedia('(max-width: 576px)');
      this._mobileQueryListener = () => changeDetectorRef.detectChanges();
      this.mobileQuery.addListener(this._mobileQueryListener);
      this.login.cartPreviewItemObservable.subscribe(item => {
        if(item) {
          console.log("HEY HEY HEY");
          this.cartPreviewItem = item;
          if(!this.mobileQuery.matches) {
            this.showCartPreview = true
          } else {
            this.bottomSheet.open(CartpreviewbottomsheetComponent, {
              data: { bottomSheetItem : item },
            });
          }
        }
      });
      router.events.subscribe(val => {
        this.showCartPreview = false;
        this.bottomSheet.dismiss();
      })
  }

  ngOnInit(): void {
    this.login.inAdminObservable.subscribe(inAdmin => {
      this.adminView = inAdmin;
      console.log("this.adminView " + this.adminView);
    });
    // setTimeout(_ => {this.showCartPreview = true}, 4000)
  }
}
