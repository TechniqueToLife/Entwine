import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShippingAdminComponent } from './shipping-admin.component';

describe('ShippingAdminComponent', () => {
  let component: ShippingAdminComponent;
  let fixture: ComponentFixture<ShippingAdminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ShippingAdminComponent]
    });
    fixture = TestBed.createComponent(ShippingAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
