import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DetectorResponse } from '../../../diagnostic-data/models/detector';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';
import * as moment from 'moment';
import { TelemetryService } from '../../services/telemetry/telemetry.service';
import { TelemetryEventNames } from '../../services/telemetry/telemetry.common';


@Component({
  selector: 'detector-view',
  templateUrl: './detector-view.component.html',
  styleUrls: ['./detector-view.component.css']
})
export class DetectorViewComponent implements OnInit {

  detectorDataLocalCopy: DetectorResponse;
  errorState: any;
  isPublic: boolean = true;

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

  @Input() startTime: moment.Moment;
  @Input() endTime: moment.Moment;

  @Input() showEdit: boolean = true;
  @Input() insideDetectorList: boolean = false;


  constructor(@Inject(DIAGNOSTIC_DATA_CONFIG) config: DiagnosticDataConfig, private telemetryService: TelemetryService) {
    this.isPublic = config && config.isPublic;
  }

  ngOnInit() {
    this.detectorResponseSubject.subscribe((data: DetectorResponse) => {
      this.detectorDataLocalCopy = data;
      if (data) {
        let detectorEventProps: {[name:string] : string} = {
          "StartTime": String(this.startTime),
          "EndTime": String(this.endTime),
          "DetectorId": data.metadata.id
        }
        this.telemetryService.setDetectEventProperties(detectorEventProps);
      }
    });
    
    this.errorSubject.subscribe((data: any) => { 
      this.errorState = data;
    });

    // The detector name can be retrieved from url attribute of url column of application insights pageviews table.
    if (!this.insideDetectorList) {
      this.telemetryService.logPageView(TelemetryEventNames.DetectorViewLoaded);
    }
  }
}
