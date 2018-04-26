import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicInsightComponent } from './dynamic-insight.component';

describe('DynamicInsightComponent', () => {
  let component: DynamicInsightComponent;
  let fixture: ComponentFixture<DynamicInsightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicInsightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicInsightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
