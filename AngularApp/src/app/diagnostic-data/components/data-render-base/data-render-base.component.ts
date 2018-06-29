import { Component, OnInit, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DiagnosticData, RenderingType } from '../../models/detector';
import * as momentNs from 'moment-timezone';
const moment = momentNs;

@Component({
  templateUrl: './data-render-base.component.html'
})
export class DataRenderBaseComponent implements OnInit, DataRenderer {

  protected DataRenderingType: RenderingType;

  private _diagnosticDataSubject: ReplaySubject<DiagnosticData> = new ReplaySubject<DiagnosticData>(1);

  @Input() set diagnosticDataInput(detector: DiagnosticData) {
    this._diagnosticDataSubject.next(detector);
  };

  diagnosticData: DiagnosticData;

  @Input() startTime: momentNs.Moment;
  @Input() endTime: momentNs.Moment;
  @Input() timeGrainInMinutes: number = 5;

  constructor() {
   }

   ngOnChanges() {
   }

  ngOnInit() {
    this._diagnosticDataSubject.subscribe((data: DiagnosticData) => {
      this.processData(data);
    });
  }

  protected processData(data: DiagnosticData) {
    if (data) {
      this.diagnosticData = data;
    }
  }
}

export interface DataRenderer {
  diagnosticDataInput: DiagnosticData;
}
