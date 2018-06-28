import { Injectable } from '@angular/core';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';
import { DetectorResponse, DetectorMetaData } from '../../../diagnostic-data/models/detector';
import { Observable } from 'rxjs/Observable';
import { QueryResponse } from '../../../diagnostic-data/models/compiler-response';

@Injectable()
export class ApplensDiagnosticService {

  constructor(private _diagnosticApi: DiagnosticApiService, private _resourceService: ResourceService) {
  }

  getDetector(detector: string): Observable<DetectorResponse> {
    return this._diagnosticApi.getDetector(
      this._resourceService.versionPrefix, 
      this._resourceService.getCurrentResourceId(true), 
      detector,
      this._resourceService.getRequestBody());
  }

  getDetectors(): Observable<DetectorMetaData[]> {
    return this._diagnosticApi.getDetectors(
      this._resourceService.versionPrefix, 
      this._resourceService.getCurrentResourceId(true),
      this._resourceService.getRequestBody());
  }

  getCompilerResponse(body: any): Observable<QueryResponse<DetectorResponse>> {
    body.resource = this._resourceService.getRequestBody();
    return this._diagnosticApi.getCompilerResponse(
      this._resourceService.versionPrefix,
      this._resourceService.getCurrentResourceId(true),
      body);
  }
}
