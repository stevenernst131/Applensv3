import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { DiagnosticApiService } from './diagnostic-api.service';
import {Package} from '../models/package';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';
import { StringifyOptions } from 'querystring';

@Injectable()
export class GithubApiService {

  constructor(private _http: Http, private _diagnosticApiService: DiagnosticApiService) { }

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

  public publishPackage(packageToPublish: Package): Observable<any> {
    let url: string = `${this._diagnosticApiService.getDiagnosticApi()}api/github/publishdetector`;
    return this._http.post(url, packageToPublish);
  }
}