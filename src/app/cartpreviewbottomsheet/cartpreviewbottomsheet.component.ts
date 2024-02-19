import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { Product } from '../model/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cartpreviewbottomsheet',
  templateUrl: './cartpreviewbottomsheet.component.html',
  styleUrls: ['./cartpreviewbottomsheet.component.css']
})
export class CartpreviewbottomsheetComponent {

  item! : Product;

  constructor(private router : Router, @Inject(MAT_BOTTOM_SHEET_DATA) public data: {bottomSheetItem: Product}) {
    if(data.bottomSheetItem) {
      this.item = data.bottomSheetItem;
    }
  }
  
  gotoProduct(id : string) {

  }

  gotoCart() {
    this.router.navigate(['/cart/'] , { skipLocationChange: false });
  }
}
