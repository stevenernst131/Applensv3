import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabAnalyticsDashboardComponent } from './tab-analytics-dashboard.component';

describe('TabAnalyticsDashboardComponent', () => {
  let component: TabAnalyticsDashboardComponent;
  let fixture: ComponentFixture<TabAnalyticsDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabAnalyticsDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabAnalyticsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
