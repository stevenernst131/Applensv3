import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tab-analytics-dashboard',
  templateUrl: './tab-analytics-dashboard.component.html',
  styleUrls: ['./tab-analytics-dashboard.component.css']
})
export class TabAnalyticsDashboardComponent implements OnInit {

  systemInvokerId: string = "__analytics";
  reportName: string = "Business Analytics 👻";
  constructor() { }

  ngOnInit() {
  }

}
