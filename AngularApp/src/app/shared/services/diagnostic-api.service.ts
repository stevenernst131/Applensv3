import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { DetectorResponse, DetectorMetaData } from '../../diagnostic-data/models/detector';
import { CacheService } from './cache.service';
import { QueryParamsService } from './query-params.service';
import { HttpMethod } from '../models/http';

@Injectable()
export class DiagnosticApiService {

  public readonly localDiagnosticApi: string = "http://localhost:5000/";

  constructor(private _http: Http, private _cacheService: CacheService, private _queryParamsService: QueryParamsService) { }

  private getDiagnosticApi(): string {
    return environment.production ? '': this.localDiagnosticApi;
  }

  public getDetector(resourceId: string, detector:string, resourceSpecificQueryString: string): Observable<DetectorResponse> {
    let timeParameters = this._getTimeQueryParameters();
    let path = `v4/${resourceId}/detectors/${detector}?${resourceSpecificQueryString}${timeParameters}`;
    return this.invoke<DetectorResponse>(path, HttpMethod.POST);
  }

  public getDetectors(resourceId: string): Observable<DetectorMetaData[]> {
    let path = `v4/${resourceId}/detectors`;
    return this.invoke<DetectorResponse[]>(path, HttpMethod.POST).map(detectors => detectors.map(response => response.metadata));
  }

  public invoke<T>(path: string, method: HttpMethod = HttpMethod.GET, invalidateCache: boolean = false): Observable<T> {
    var url: string = `${this.getDiagnosticApi()}api/invoke`

    let request = this._http.get(url, {
      headers: this._getHeaders(path, method)
    })
      .map((response: Response) => <T>(response.json()));

    return this._cacheService.get(this.getCacheKey(method, path), request, invalidateCache);
  }

  private getCacheKey(method: HttpMethod, path: string) {
    return `${HttpMethod[method]}-${path}`;
  }

  public get<T>(path: string, invalidateCache: boolean = false): Observable<T> {

    var url: string = `${this.getDiagnosticApi()}${path}`;

    let request = this._http.get(url, {
      headers: this._getHeaders()
    })
      .map((response: Response) => <T>(response.json()));

    return this._cacheService.get(path, request, invalidateCache);
  }

  private _getHeaders(path: string = null, method: HttpMethod = null): Headers {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    
    if (path) {
      headers.append('x-ms-path-query', path);
    }

    if (method) {
      headers.append('x-ms-method', HttpMethod[method]);
    }
    
    return headers;
  }

  private _getTimeQueryParameters() {
    let format = 'YYYY-MM-DDTHH:mm'
    return `&startTime=${this._queryParamsService.startTime.format(format)}&endTime=${this._queryParamsService.endTime.format(format)}`;
  }

}
