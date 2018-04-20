import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HdiLandingComponent } from './hdi-landing.component';

describe('HdiLandingComponent', () => {
  let component: HdiLandingComponent;
  let fixture: ComponentFixture<HdiLandingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HdiLandingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HdiLandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
