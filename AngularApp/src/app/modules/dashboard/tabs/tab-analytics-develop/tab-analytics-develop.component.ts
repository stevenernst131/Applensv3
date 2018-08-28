import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { OnboardingFlowComponent, DevelopMode } from '../../onboarding-flow/onboarding-flow.component';


@Component({
  selector: 'tab-analytics-develop',
  templateUrl: './tab-analytics-develop.component.html',
  styleUrls: ['./tab-analytics-develop.component.css']
})
export class TabAnalyticsDevelopComponent{

 // DevelopMode = DevelopMode;
  mode: DevelopMode = DevelopMode.EditAnalytics;
}
