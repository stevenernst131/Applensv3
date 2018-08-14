import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { OnboardingFlowComponent, DevelopMode } from '../../onboarding-flow/onboarding-flow.component';

@Component({
  selector: 'tab-monitoring-develop',
  templateUrl: './tab-monitoring-develop.component.html',
  styleUrls: ['./tab-monitoring-develop.component.css']
})
export class TabMonitoringDevelopComponent implements OnInit {

  @Input() systemInvokerId: string = "__monitoring";
  DevelopMode = DevelopMode;
  detectorId: string;
  private dataSourceMapping: Map<string, string> = new Map<string, string>([
    ["All", "0"],
    ["Applens",  "1"],
    ["Azure Portal", "2"]
  ]);
  dataSourceKeys: string[];
  selectedDataSource: string = "All";
  dataSourceFlag: string = "0";

  private timeRangeMapping: Map<string, string> = new Map<string, string>([
    ["Last 24 hours", "24"],
    ["Last 3 days",  "72"],
    ["Last 7 days", "168"]
  ]);
  timeRangeKeys: string[];
  selectedTimeRange: string = "Last 7 days";
  timeRangeInHours: string = "168";


  constructor(private _route: ActivatedRoute) {
  }

  ngOnInit() {
    this.detectorId = this._route.parent.snapshot.params['detector'].toLowerCase();
    this.dataSourceKeys = Array.from(this.dataSourceMapping.keys());
    this.timeRangeKeys = Array.from(this.timeRangeMapping.keys());
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

