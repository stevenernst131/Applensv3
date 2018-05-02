import { Injectable } from '@angular/core';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';
import { DetectorResponse } from '../../../diagnostic-data/models/detector';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ApplensDiagnosticService {

  constructor(private _diagnosticApi: DiagnosticApiService, private _resourceService: ResourceService) {
  }

  getDetector(detector: string): Observable<DetectorResponse> {
    return this._diagnosticApi.getDetector(
      this._resourceService.getVersion(), 
      this._resourceService.getCurrentResourceId(), 
      detector, 
      this._resourceService.getDiagnosticRoleQueryString());
  }

}
