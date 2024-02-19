import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartpreviewbottomsheetComponent } from './cartpreviewbottomsheet.component';

describe('CartpreviewbottomsheetComponent', () => {
  let component: CartpreviewbottomsheetComponent;
  let fixture: ComponentFixture<CartpreviewbottomsheetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CartpreviewbottomsheetComponent]
    });
    fixture = TestBed.createComponent(CartpreviewbottomsheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
