import { Component, OnInit, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DetectorResponse } from '../../../diagnostic-data/models/detector';

@Component({
  selector: 'detector-view',
  templateUrl: './detector-view.component.html',
  styleUrls: ['./detector-view.component.css']
})
export class DetectorViewComponent implements OnInit {

  private detectorDataLocalCopy: DetectorResponse;
  private errorState: any;

  private detectorResponseSubject: BehaviorSubject<DetectorResponse> = new BehaviorSubject<DetectorResponse>(null);
  private errorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  @Input()
  set detectorResponse(value: DetectorResponse) {
    this.detectorResponseSubject.next(value);
  };

  @Input()
  set error(value: any) {
    this.errorSubject.next(value);
  }

  constructor() { }

  ngOnInit() {
    this.detectorResponseSubject.subscribe((data: DetectorResponse) => {
      this.detectorDataLocalCopy = data;
    });

    this.errorSubject.subscribe((data: any) => {
      this.errorState = data;
    });
  }
}
