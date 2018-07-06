import { Component, OnInit } from '@angular/core';
import { DetectorResponse } from '../../../../diagnostic-data/models/detector';
import { ActivatedRoute, Params } from '@angular/router';
import { QueryParamsService } from '../../../../shared/services/query-params.service';
import { ApplensDiagnosticService } from '../../services/applens-diagnostic.service';

@Component({
  selector: 'tab-data',
  templateUrl: './tab-data.component.html',
  styleUrls: ['./tab-data.component.css']
})
export class TabDataComponent implements OnInit {

  constructor(private _route: ActivatedRoute, private _diagnosticApiService: ApplensDiagnosticService, public queryParamsService: QueryParamsService) { }

  detectorResponse: DetectorResponse;

  detector: string;

  error: any;

  dataSourceMode : boolean = false;
  loadingDetector : boolean = true;

  ngOnInit() {

    this._route.params.subscribe((params: Params) => {
      this.getDetectorResponse();
    });

    this._route.queryParams.subscribe((queryParams: Params) => {
      this.getDetectorResponse();
    })
  }

  refresh() {
    this.getDetectorResponse();
  }

  getDetectorResponse() {
    this.detectorResponse = null;
    if (this._route.snapshot.params['detector']) {
      this.detector = this._route.snapshot.params['detector'];
    }
    else {
      this.detector = this._route.parent.snapshot.params['detector'].toLowerCase();
      this.dataSourceMode = true;
    }

    this._diagnosticApiService.getDetector(this.detector)
      .subscribe((response: DetectorResponse) => {
        this.loadingDetector = false;
        this.detectorResponse = response;
      }, (error: any) => {
        this.error = error;
      });
  }
}
