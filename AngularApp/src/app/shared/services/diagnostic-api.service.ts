import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { SignalResponse } from '../../diagnostic-data/models/signal';

@Injectable()
export class DiagnosticApiService {

  public readonly localDiagnosticApi: string = "http://localhost:22533/";

  constructor(private _http: Http) { }

  private getDiagnosticApi(): string {
    return environment.production ? '': this.localDiagnosticApi;
  }

  public getDetector(resourceId: string, detector:string, resourceSpecificQueryString: string): Observable<SignalResponse> {
    console.log("get detector:" + detector);
    let path = `v4/${resourceId}/diagnostics/detectors/${detector}?${resourceSpecificQueryString}`;
    return this.invoke<SignalResponse>(path);
  }

  public invoke<T>(path: string): Observable<T> {
    var url: string = `${this.getDiagnosticApi()}api/invoke`

    return this._http.get(url, {
      headers: this._getHeaders(path)
    })
      .map((response: Response) => <T>(response.json()));
  }

  public get<T>(path: string): Observable<T> {
    

    var url: string = `${this.getDiagnosticApi()}${path}`;

    return this._http.get(url, {
      headers: this._getHeaders(path)
    })
      .map((response: Response) => <T>(response.json()));
  }

  private _getHeaders(path: string): Headers {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('x-ms-path-query', path);

    return headers;
  }

}
