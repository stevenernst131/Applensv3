import { Component, OnInit, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DiagnosticData } from '../../models/signal';

@Component({
  templateUrl: './data-render-base.component.html'
})
export class DataRenderBaseComponent implements OnInit, DataRenderer {

  private _diagnosticDataSubject: ReplaySubject<DiagnosticData> = new ReplaySubject<DiagnosticData>(1);

  @Input() set diagnosticDataInput(signal: DiagnosticData) {
    this._diagnosticDataSubject.next(signal);
  };

  diagnosticData: DiagnosticData;

  constructor() { }

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
