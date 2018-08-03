import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { OnboardingFlowComponent, DevelopMode } from '../../onboarding-flow/onboarding-flow.component';


@Component({
  selector: 'tab-analytics-develop',
  templateUrl: './tab-analytics-develop.component.html',
  styleUrls: ['./tab-analytics-develop.component.css']
})
export class TabAnalyticsDevelopComponent implements OnInit {

  DevelopMode = DevelopMode;
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
    console.log(`selectedDataSource: ${this.selectedDataSource}, dataSourceFlag: ${this.dataSourceFlag} `);
  }

  setTimeRange(selectedTimeRange: string) {
    this.selectedTimeRange = selectedTimeRange;
    this.timeRangeInHours = this.timeRangeMapping.get(selectedTimeRange);
    console.log(`selectedTimeRange: ${this.selectedTimeRange}, timeRangeInHours: ${this.timeRangeInHours} `);
  }

}
