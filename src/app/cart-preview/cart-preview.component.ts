import { Component, Inject, Input } from '@angular/core';
import { Product } from '../model/product';
import { Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-cart-preview',
  templateUrl: './cart-preview.component.html',
  styleUrls: ['./cart-preview.component.css'],
})
export class CartPreviewComponent {
  @Input() item! : Product;

  constructor(private router : Router) {

  }

  gotoProduct(id : string) {

  }

  gotoCart() {
    this.router.navigate(['/cart/'] , { skipLocationChange: false });
  }
}
