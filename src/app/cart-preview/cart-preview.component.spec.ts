import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartPreviewComponent } from './cart-preview.component';

describe('CartPreviewComponent', () => {
  let component: CartPreviewComponent;
  let fixture: ComponentFixture<CartPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CartPreviewComponent]
    });
    fixture = TestBed.createComponent(CartPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
