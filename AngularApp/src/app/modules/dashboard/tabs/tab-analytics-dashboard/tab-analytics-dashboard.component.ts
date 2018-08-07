import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tab-analytics-dashboard',
  templateUrl: './tab-analytics-dashboard.component.html',
  styleUrls: ['./tab-analytics-dashboard.component.css']
})
export class TabAnalyticsDashboardComponent implements OnInit {

  private systemInvokerId: string = "__analytics";
  private reportName: string = "Business Analytics 👻 ";
  constructor() { }

  ngOnInit() {
  }

}
