import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetectorDiffViewComponent } from './detector-diff-view.component';

describe('DetectorDiffViewComponent', () => {
  let component: DetectorDiffViewComponent;
  let fixture: ComponentFixture<DetectorDiffViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetectorDiffViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetectorDiffViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
