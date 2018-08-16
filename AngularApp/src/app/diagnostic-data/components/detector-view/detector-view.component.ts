import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DetectorResponse, RenderingType } from '../../models/detector';
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
  private detectorEventProperties: { [name: string]: string };
  private ratingEventProperties: { [name: string]: string };
  private authorEmails: string;
  private insightsListEventProperties = {};

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
  @Input() timeGrainInMinutes: number = 5;

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

        if (data.metadata && data.metadata.author) {
          let separators = [' ', ',', ';', ':'];
          let authors = data.metadata.author.split(new RegExp(separators.join('|'), 'g'));
          let authorsArray: string[] = [];
          authors.forEach(author => {
            if (author && author.length > 0) {
              authorsArray.push(`${author}@microsoft.com`);
            }
          });
          this.authorEmails = authorsArray.join(";");
        }

        // Log all the insights from response
        if (data.dataset) {
          let totalCount: number = 0;
          let successCount: number = 0;
          let criticalCount: number = 0;
          let warningCount: number = 0;
          let infoCount: number = 0;
          let defaultCount: number = 0;
          let insightsList = [];
          let insightsNameList: string[] = [];

          let statusColumnIndex = 0;
          let insightColumnIndex = 1;
          let isExpandedIndex = 4;

          data.dataset.forEach(dataset => {
            if (dataset.renderingProperties && dataset.renderingProperties.type === RenderingType.Insights) {
              dataset.table.rows.forEach(row => {
                if ((insightsNameList.find(insightName => insightName === row[insightColumnIndex])) == null) {
                  {
                    let isExpanded: boolean = row.length > isExpandedIndex ? row[isExpandedIndex].toLowerCase() === 'true' : false
                    var insightInstance = {
                      "Name": row[insightColumnIndex],
                      "Status": row[statusColumnIndex],
                      "IsExpandedByDefault": isExpanded
                    }
                    insightsList.push(insightInstance);
                    insightsNameList.push(row[insightColumnIndex]);

                    switch (row[statusColumnIndex]) {
                      case "Critical":
                        criticalCount++;
                        break;
                      case "Warning":
                        warningCount++;
                        break;
                      case "Success":
                        successCount++;
                        break;
                      case "Info":
                        infoCount++;
                        break;
                      default:
                        defaultCount++;
                    }
                  }
                }
              });
            }
          });

          totalCount = insightsList.length;

          var insightSummary = {
            "Total": totalCount,
            "Critical": criticalCount,
            "Warning": warningCount,
            "Success": successCount,
            "Info": infoCount,
            "Default": defaultCount
          }

          this.insightsListEventProperties = {
            "InsightsList": JSON.stringify(insightsList),
            "InsightsSummary": JSON.stringify(insightSummary)
          }

          this.logEvent(TelemetryEventNames.InsightsSummary, this.insightsListEventProperties);
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

  protected logEvent(eventMessage: string, eventProperties?: any, measurements?: any) {
    for (let id in this.detectorEventProperties) {
      eventProperties[id] = String(this.detectorEventProperties[id]);
    }
    this.telemetryService.logEvent(eventMessage, eventProperties, measurements);
  }
}

