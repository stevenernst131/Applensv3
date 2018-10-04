import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { DetectorResponse, DetectorMetaData } from '../../diagnostic-data/models/detector';
import { CacheService } from './cache.service';
import { HttpMethod } from '../models/http';
import { QueryResponse } from '../../diagnostic-data/models/compiler-response';
import { AuthService } from './auth.service';
import { Package } from '../models/package';

@Injectable()
export class DiagnosticApiService {

  public readonly localDiagnosticApi: string = "http://localhost:5000/";

  constructor(private _http: Http, private _cacheService: CacheService, private _authService: AuthService) { }

  public get diagnosticApi(): string {
    return environment.production ? '' : this.localDiagnosticApi;
  }

  public getDetector(version: string, resourceId: string, detector: string, startTime?: string, endTime?: string, body?: any, refresh: boolean = false, internalView: boolean = false): Observable<DetectorResponse> {
    let timeParameters = this._getTimeQueryParameters(startTime, endTime);
    let path = `${version}${resourceId}/detectors/${detector}?${timeParameters}`;
    return this.invoke<DetectorResponse>(path, HttpMethod.POST, body, true, refresh, internalView);
  }

  public getSystemInvoker(resourceId: string, detector: string, systemInvokerId: string = '', dataSource: string, timeRange: string, body?: any): Observable<DetectorResponse> {
    let invokerParameters = this._getSystemInvokerParameters(dataSource, timeRange);
    let path = `/${resourceId}/detectors/${detector}/statistics/${systemInvokerId}?${invokerParameters}`;
    return this.invoke<DetectorResponse>(path, HttpMethod.POST, body);
  }

  public getDetectors(version: string, resourceId: string, body?: any): Observable<DetectorMetaData[]> {
    let path = `${version}${resourceId}/detectors`;
    return this.invoke<DetectorResponse[]>(path, HttpMethod.POST, body).map(response => response.map(detector => detector.metadata));
  }

  public getCompilerResponse(version: string, resourceId: string, body: any, startTime?: string, endTime?: string): Observable<QueryResponse<DetectorResponse>> {
    let timeParameters = this._getTimeQueryParameters(startTime, endTime);
    let path = `${version}${resourceId}/diagnostics/query?${timeParameters}`;
    return this.invoke<QueryResponse<DetectorResponse>>(path, HttpMethod.POST, body, false);
  }

  public getSystemCompilerResponse(resourceId: string, body: any, detectorId: string = '', dataSource: string = '', timeRange: string = ''): Observable<QueryResponse<DetectorResponse>> {
    let invokerParameters = this._getSystemInvokerParameters(dataSource, timeRange);
    let path = `/${resourceId}/detectors/${detectorId}/statisticsQuery?${invokerParameters}`;
    return this.invoke<QueryResponse<DetectorResponse>>(path, HttpMethod.POST, body, false);
  }

  public getLocalDevelopmentResponse(detectorId: string, version: string, resourceId: string, body: any, startTime?: string, endTime?: string): Observable<string> {
    let timeParameters = this._getTimeQueryParameters(startTime, endTime);
    let path = resourceId;
    var url: string = `${this.diagnosticApi}api/localdev?detectorId=${detectorId}`;

    let method : HttpMethod = HttpMethod.POST; 
    let request = this._http.post(url, body, {
      headers: this._getHeaders(path, method)
    })
      .map((response: Response) => <String>(response.json()));

    return this._cacheService.get(this.getCacheKey(method, path), request, true);
  }

  public publishDetector(resourceId: string, packageToPublish: Package): Observable<any> {
    let path = `${resourceId}/diagnostics/publish`;
    return this.invoke<any>(path, HttpMethod.POST, packageToPublish, true);
  }

  public invoke<T>(path: string, method: HttpMethod = HttpMethod.GET, body: any = {}, useCache: boolean = true, invalidateCache: boolean = false, internalView: boolean = true): Observable<T> {
    var url: string = `${this.diagnosticApi}api/invoke`

    let request = this._http.post(url, body, {
      headers: this._getHeaders(path, method, internalView)
    })
      .map((response: Response) => <T>(response.json()));

    return useCache ? this._cacheService.get(this.getCacheKey(method, path), request, invalidateCache) : request;
  }

  private getCacheKey(method: HttpMethod, path: string) {
    return `${HttpMethod[method]}-${path}`;
  }

  public get<T>(path: string, invalidateCache: boolean = false): Observable<T> {

    var url: string = `${this.diagnosticApi}${path}`;

    let request = this._http.get(url, {
      headers: this._getHeaders()
    })
      .map((response: Response) => <T>(response.json()));

    return this._cacheService.get(path, request, invalidateCache);
  }

  private _getHeaders(path?: string, method?: HttpMethod, internalView: boolean = true): Headers {
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Authorization', `Bearer ${this._authService.accessToken}`);
    headers.append('x-ms-internal-client', String(true));
    headers.append('x-ms-internal-view', String(internalView));
    if (path) {
      headers.append('x-ms-path-query', path);
    }

    if (method) {
      headers.append('x-ms-method', HttpMethod[method]);
    }

    return headers;
  }

  private _getTimeQueryParameters(startTime: string, endTime: string) {
    // let format = 'YYYY-MM-DDTHH:mm'
    // return `&startTime=${this._detectorControlService.startTime.format(format)}&endTime=${this._detectorControlService.endTime.format(format)}`;
    return `&startTime=${startTime}&endTime=${endTime}`;
  }

  private _getSystemInvokerParameters(systemDataSource: string, timeRange: string) {
    return `&dataSource=${systemDataSource}&timeRange=${timeRange}`;
  }
}
