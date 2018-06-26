import { Component, OnInit, Input } from '@angular/core';
import { GithubApiService } from '../../../../shared/services/github-api.service';
import { DetectorResponse } from '../../../../diagnostic-data/models/detector';
import { QueryResponse, CompilerResponse } from '../../../../diagnostic-data/models/compiler-response';
import { ActivatedRoute, Params } from '@angular/router';
import { DiagnosticApiService } from '../../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../../shared/services/resource.service';
import { Package } from '../../../../shared/models/package';
import { QueryParamsService } from '../../../../shared/services/query-params.service';
import { OnboardingFlowComponent, DevelopMode } from '../../onboarding-flow/onboarding-flow.component';

@Component({
  selector: 'tab-develop',
  templateUrl: './tab-develop.component.html',
  styleUrls: ['./tab-develop.component.css']
})
export class TabDevelopComponent implements OnInit {

  DevelopMode = DevelopMode;
  detectorId: string;

  constructor(private _route: ActivatedRoute) {
  }

  ngOnInit() {
    this.detectorId = this._route.parent.snapshot.params['signal'].toLowerCase();
  }

}
