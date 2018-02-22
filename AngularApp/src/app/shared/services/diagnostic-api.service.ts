import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { DetectorResponse, DetectorMetaData } from '../../diagnostic-data/models/detector';
import { CacheService } from './cache.service';

@Injectable()
export class DiagnosticApiService {

  public readonly localDiagnosticApi: string = "http://localhost:22533/";

  constructor(private _http: Http, private _cacheService: CacheService) { }

  private getDiagnosticApi(): string {
    return environment.production ? '': this.localDiagnosticApi;
  }

  public getDetector(resourceId: string, detector:string, resourceSpecificQueryString: string): Observable<DetectorResponse> {
    let path = `v4/${resourceId}/diagnostics/detectors/${detector}?${resourceSpecificQueryString}`;
    return this.invoke<DetectorResponse>(path);
  }

  public getDetectors(resourceId: string): Observable<DetectorMetaData[]> {
    let path = `v4/${resourceId}/diagnostics/detectors`;
    return this.invoke<DetectorMetaData[]>(path);
  }

  public invoke<T>(path: string, invalidateCache: boolean = false): Observable<T> {
    var url: string = `${this.getDiagnosticApi()}api/invoke`

    let request = this._http.get(url, {
      headers: this._getHeaders(path)
    })
      .map((response: Response) => <T>(response.json()));

    return this._cacheService.get(path, request, invalidateCache);
  }

  public get<T>(path: string, invalidateCache: boolean = false): Observable<T> {

    var url: string = `${this.getDiagnosticApi()}${path}`;

    let request = this._http.get(url, {
      headers: this._getHeaders()
    })
      .map((response: Response) => <T>(response.json()));

    return this._cacheService.get(path, request, invalidateCache);
  }

  private _getHeaders(path: string = null): Headers {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    
    if(path){
      headers.append('x-ms-path-query', path);
    }
    
    return headers;
  }

}
