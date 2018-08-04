import { Component, OnInit, Input } from '@angular/core';
import { DetectorResponse } from '../../../../diagnostic-data/models/detector';
import { ActivatedRoute, Params } from '@angular/router';
import { QueryParamsService } from '../../../../shared/services/query-params.service';
import { ApplensDiagnosticService } from '../../services/applens-diagnostic.service';

@Component({
  selector: 'tab-monitoring',
  templateUrl: './tab-monitoring.component.html',
  styleUrls: ['./tab-monitoring.component.css']
})

export class TabMonitoringComponent implements OnInit {
  constructor(private _route: ActivatedRoute, private _diagnosticApiService: ApplensDiagnosticService, public queryParamsService: QueryParamsService) { }

  detectorResponse: DetectorResponse;

  @Input() systemInvokerId: string = "__monitoring";
  private detectorId: string;
  private dataSourceMapping: Map<string, string> = new Map<string, string>([
    ["All", "0"],
    ["Applens",  "1"],
    ["Azure Portal", "2"]
  ]);
  private dataSourceKeys: string[];
  private selectedDataSource: string = "All";
  private dataSourceFlag: string = "0";

  private timeRangeMapping: Map<string, string> = new Map<string, string>([
    ["Last 24 hours", "24"],
    ["Last 3 days",  "72"],
    ["Last 7 days", "168"]
  ]);
  private timeRangeKeys: string[];
  private selectedTimeRange: string = "Last 7 days";
  private timeRangeInHours: string = "168";

  error: any;

  ngOnInit() {

    this.getMonitoringResponse();
    this.dataSourceKeys = Array.from(this.dataSourceMapping.keys());
    this.timeRangeKeys = Array.from(this.timeRangeMapping.keys());
  }

  refresh() {
    this.getMonitoringResponse();
  }

  getMonitoringResponse() {
    this.detectorResponse = null;
    this.detectorId = this._route.parent.snapshot.params['detector'].toLowerCase();
    this._diagnosticApiService.getSystemInvoker(this.detectorId, this.systemInvokerId, this.dataSourceFlag, this.timeRangeInHours)
      .subscribe((response: DetectorResponse) => {
        this.detectorResponse = response;
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
  }
}
