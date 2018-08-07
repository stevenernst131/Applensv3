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
  isPublic: boolean;

  private detectorResponseSubject: BehaviorSubject<DetectorResponse> = new BehaviorSubject<DetectorResponse>(null);
  private errorSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private detectorEventProperties: {[name: string]: string};
  private ratingEventProperties: {[name: string]: string};
  private authorEmails: string;

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
  @Input() isSystemInvoker: boolean = false;


  constructor(@Inject(DIAGNOSTIC_DATA_CONFIG) config: DiagnosticDataConfig, private telemetryService: TelemetryService) {
    this.isPublic = config && config.isPublic;
  }

  ngOnInit() {
    this.detectorResponseSubject.subscribe((data: DetectorResponse) => {
      this.detectorDataLocalCopy = data;
      if (data) {
        this.detectorEventProperties = {
          "StartTime": String(this.startTime),
          "EndTime": String(this.endTime),
          "DetectorId": data.metadata.id
        }

        this.ratingEventProperties = {
          "DetectorId": data.metadata.id
        }
        
        if (data.metadata && data.metadata.author)
        {
          let separators = [' ', ',', ';', ':'];
          let authors = data.metadata.author.split(new RegExp(separators.join('|'), 'g'));
          let authorsArray: string[] = [];
          authors.forEach(author => {
            if (author && author.length > 0)
            {
              authorsArray.push(`${author}@microsoft.com`);
            }
          });
          this.authorEmails  = authorsArray.join(";");
        }
      }
    });

    this.errorSubject.subscribe((data: any) => {
      this.errorState = data;
    });

    // The detector name can be retrieved from  url column of application insight resource pageviews table.
    if (!this.insideDetectorList) {
      this.telemetryService.logPageView(TelemetryEventNames.DetectorViewLoaded);
    }
  }
}


