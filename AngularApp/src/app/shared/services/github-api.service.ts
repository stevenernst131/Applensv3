import { Injectable } from '@angular/core';
import { DiagnosticApiService } from './diagnostic-api.service';
import {Package} from '../models/package';
import { Observable } from 'rxjs';
import { Dictionary } from '../models/extensions';
import { Commit } from '../../diagnostic-data/models/changelist';

@Injectable()
export class GithubApiService {

  constructor(private _diagnosticApiService: DiagnosticApiService) { }

  public getDetectorTemplate(name): Observable<string> {
    return this._diagnosticApiService.get<string>(`api/github/detectortemplate/${name}`, true);
  }

  public getDetectorFile(id: string): Observable<string> {
    return this._diagnosticApiService.get<string>(`api/github/detectors/${id}`, true);
  }

  public getSystemInvokerFile(id: string): Observable<string> {
    return this._diagnosticApiService.get<string>(`api/github/detectors/${id}`, true);
  }

  public getSystemMonitoringFile(detectorId: string, invokerId: string): Observable<string> {
    return this._diagnosticApiService.get<string>(`api/github/detectors/${detectorId}/statistics/${invokerId}`, true);
  }

  public getDetectorChangelist(detectorId: string): Observable<Dictionary<Dictionary<string>>> {
    return this._diagnosticApiService.getDetectorChangelist(detectorId);
  }
}