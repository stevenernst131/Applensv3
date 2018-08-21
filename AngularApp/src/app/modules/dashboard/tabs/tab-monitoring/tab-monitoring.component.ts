import { Component, OnInit, Input } from '@angular/core';
import { DetectorResponse } from '../../../../diagnostic-data/models/detector';
import { ActivatedRoute, Params } from '@angular/router';
import { QueryParamsService } from '../../../../shared/services/query-params.service';
import { ApplensDiagnosticService } from '../../services/applens-diagnostic.service';
import * as moment from 'moment';
import 'moment-timezone';
import { TimeZones } from '../../../../shared/models/datetime';


export enum StatisticsType{
  Monitoring,
  Analytics
}

@Component({
  selector: 'tab-monitoring',
  templateUrl: './tab-monitoring.component.html',
  styleUrls: ['./tab-monitoring.component.css']
})

export class TabMonitoringComponent implements OnInit {
  constructor(private _route: ActivatedRoute, private _diagnosticApiService: ApplensDiagnosticService, public queryParamsService: QueryParamsService) { }

  systemInvokerResponse: DetectorResponse;
  detectorAuthor: String = "";
  private authorEmails: string;

  @Input() systemInvokerId: string = "__monitoring";
  @Input() statisticsType: StatisticsType = StatisticsType.Monitoring;

  reportName: string = "";
  private detectorId: string;
  private dataSourceMapping: Map<string, string> = new Map<string, string>([
    ["All", "0"],
    ["Applens",  "1"],
    ["Azure Portal", "2"]
  ]);
  dataSourceKeys: string[];
  selectedDataSource: string = "All";
  private dataSourceFlag: string = "0";

  private timeRangeMapping: Map<string, string> = new Map<string, string>([
    ["Last 24 hours", "24"],
    ["Last 3 days",  "72"],
    ["Last 7 days", "168"]
  ]);
  timeRangeKeys: string[];
  selectedTimeRange: string = "Last 7 days";
  private timeRangeInHours: string = "168";

  endTime: moment.Moment = moment.tz(TimeZones.UTC);
  startTime: moment.Moment = this.endTime.clone().subtract(7, 'days');
  timeGrainInMinutes: number = 60;

  error: any;

  ngOnInit() {
    this.getMonitoringResponse();
    this.getDetectorResponse();
    this.dataSourceKeys = Array.from(this.dataSourceMapping.keys());
    this.timeRangeKeys = Array.from(this.timeRangeMapping.keys());
  }

  refresh() {
    this.getMonitoringResponse();
  }

  getMonitoringResponse() {
    this.systemInvokerResponse = null;
    this.detectorId = this._route.parent.snapshot.params['detector'].toLowerCase();
    this._diagnosticApiService.getSystemInvoker(this.detectorId, this.systemInvokerId, this.dataSourceFlag, this.timeRangeInHours)
      .subscribe((response: DetectorResponse) => {
        this.systemInvokerResponse = response;
      }, (error: any) => {
        this.error = error;
      });
  }

  getDetectorResponse() {
    this.detectorId = this._route.parent.snapshot.params['detector'].toLowerCase();

    this._diagnosticApiService.getDetector(this.detectorId)
      .subscribe((response: DetectorResponse) => {
        if (response && response.metadata) {
          if (response.metadata.name) {
            this.reportName = this.statisticsType === StatisticsType.Monitoring ? `${response.metadata.name} Monitoring Report 📈`: `${response.metadata.name} Analytics 📊`;
          }
          if (response.metadata.author) {
            this.detectorAuthor = response.metadata.author;
            let separators = [' ', ',', ';', ':'];
            let authors = response.metadata.author.split(new RegExp(separators.join('|'), 'g'));
            let authorsArray: string[] = [];
            authors.forEach(author => {
              if (author && author.length > 0) {
                authorsArray.push(`${author}@microsoft.com`);
              }
            });
            this.authorEmails = authorsArray.join(";");
          }
        }
      }, (error: any) => {
        this.error = error;
      });
  }

  setDataSource(selectedDataSource: string) {
    this.selectedDataSource = selectedDataSource;
    this.dataSourceFlag = this.dataSourceMapping.get(selectedDataSource);
  }

  setTimeRange(selectedTimeRange: string) {
    this.selectedTimeRange = selectedTimeRange;
    this.timeRangeInHours = this.timeRangeMapping.get(selectedTimeRange);

    // Update startTime and timeGrain for rendering purpose
    let timeRangeInDays: number = parseInt(this.timeRangeInHours)/24;
    this.startTime = this.endTime.clone().subtract(timeRangeInDays, 'days');
    if (timeRangeInDays === 1)
      this.timeGrainInMinutes = 5;
    else if (timeRangeInDays === 3)
      this.timeGrainInMinutes = 15;
    else if (timeRangeInDays === 7)
      this.timeGrainInMinutes = 60;
  }
}
