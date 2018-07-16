import { Component, OnInit, Input, ReflectiveInjector } from '@angular/core';
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
    this.logPageView("Detector Base rendering type");
  }


  public logEvent(message?: string, properties?: any, measurements?: any) {
    this.telemetryService.logEvent(message, properties, measurements);
  }

  public logPageView(name?: string, url?: string, properties?: any, measurements?: any, duration?: number) {
    this.telemetryService.logPageView(name, url, properties, measurements, duration);
  }


  public logException(exception: Error, handledAt?: string, properties?: any, measurements?: any, severityLevel?: AI.SeverityLevel) {
    this.telemetryService.logException(exception, handledAt, properties, measurements, severityLevel);
  }

  public logTrace(message: string, customProperties?: any, customMetrics?: any) {
    this.telemetryService.logTrace(message, customProperties);
  }

  public logMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: any) {
    this.telemetryService.logMetric(name, average, sampleCount, min, max, properties);
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
