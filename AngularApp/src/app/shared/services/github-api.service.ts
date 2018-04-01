import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { DiagnosticApiService } from './diagnostic-api.service';
import {Package} from '../models/package';
import { Observable } from 'rxjs';

@Injectable()
export class GithubApiService {

  constructor(private _http: Http, private _diagnosticApiService: DiagnosticApiService) { }

  public getDetectorTemplate(): Observable<string> {
    return this._diagnosticApiService.get<string>(`api/github/detectortemplate`);
  }

  public getDetectorFile(id: string): Observable<string> {
    return this._diagnosticApiService.get<string>(`api/github/${id}`);
  }

  public publishPackage(packageToPublish: Package): Observable<any> {
    let url: string = `${this._diagnosticApiService.getDiagnosticApi()}api/github/publishdetector`;
    return this._http.post(url, packageToPublish);
  }
}