import { Component, OnInit } from '@angular/core';
import { DetectorResponse, RenderingType } from '../../../diagnostic-data/models/detector';
import { Router, ActivatedRoute, Params, NavigationExtras } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';
import { QueryParamsService } from '../../../shared/services/query-params.service';

@Component({
  selector: 'signal-container',
  templateUrl: './signal-container.component.html',
  styleUrls: ['./signal-container.component.css']
})
export class SignalContainerComponent implements OnInit {

  constructor(private _router: Router, private _route: ActivatedRoute, private _diagnosticApiService: DiagnosticApiService, private _resourceService: ResourceService,
    public queryParamsService: QueryParamsService) { }

  signalResponse: DetectorResponse;

  signal: string;

  resourceId: string;

  error: any;

  ngOnInit() {

    this.resourceId = this._resourceService.getCurrentResourceId();

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
    this.signalResponse = null;
    this.signal = this._route.snapshot.params['signal'];
    this._diagnosticApiService.getDetector(this._resourceService.getVersion(), this.resourceId, this.signal, this._resourceService.getDiagnosticRoleQueryString())
    .subscribe((response: DetectorResponse) => {
      this.signalResponse = response;
    }, (error: any) => {
      this.error = error;
    });
  }

  onEditClicked(event: any): void {
    
    let navigationExtras: NavigationExtras = {
      queryParamsHandling: 'preserve',
      preserveFragment: true,
      relativeTo: this._route
    };

    this._router.navigate(['edit'], navigationExtras);
  }
}
