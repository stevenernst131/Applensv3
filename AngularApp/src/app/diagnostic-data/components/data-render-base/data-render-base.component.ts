import { Component, OnInit, Input } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { DiagnosticData, RenderingType } from '../../models/detector';
import * as momentNs from 'moment-timezone';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
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


  constructor(protected telemetryService: TelemetryService) {
    // var dataEventProperties: { [name: string]: string } = {
    //   StartTime: String(this.startTime),
    //   EndTime: String(this.endTime)
    // }

    // console.log("StartTime: " + this.startTime + "End: " + this.endTime);
    // this.telemetryService.eventPropertiesSubject.next(dataEventProperties);
    // for (let key in dataEventProperties) {
    //   console.log("rendering base with eventProperties key: " + key + "Value: " + dataEventProperties[key]);
    // }
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
