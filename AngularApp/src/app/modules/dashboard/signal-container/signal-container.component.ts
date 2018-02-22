import { Component, OnInit } from '@angular/core';
import { DetectorResponse } from '../../../diagnostic-data/models/detector';
import { ActivatedRoute, Params } from '@angular/router';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';

@Component({
  selector: 'signal-container',
  templateUrl: './signal-container.component.html',
  styleUrls: ['./signal-container.component.css']
})
export class SignalContainerComponent implements OnInit {

  constructor(private _route: ActivatedRoute, private _diagnosticApiService: DiagnosticApiService, private _resourceService: ResourceService) { }

  signalResponse:DetectorResponse;

  signal: string;

  resourceId: string

  ngOnInit() {
    
    this.resourceId = this._resourceService.getCurrentResourceId();
    
    this._route.params.subscribe((params: Params) => {
      this.signalResponse = null;
      this.signal = this._route.snapshot.params['signal'];
      this._diagnosticApiService.getDetector(this.resourceId, this.signal, this._resourceService.getDiagnosticRoleQueryString()).subscribe((response: DetectorResponse) => {
        this.signalResponse = response;
      });
    })

    
  }

}
