import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';
import { environment } from '../../../environments/environment';
import { DetectorResponse, DetectorMetaData } from '../../diagnostic-data/models/detector';
import { CacheService } from './cache.service';
import { HttpMethod } from '../models/http';
import { QueryResponse } from '../../diagnostic-data/models/compiler-response';
import { Package } from '../models/package';
import { AdalService } from 'adal-angular4';

@Injectable()
export class DiagnosticApiService {

  public readonly localDiagnosticApi: string = "http://localhost:5000/";

  constructor(private _httpClient: HttpClient, private _cacheService: CacheService, private _adalService: AdalService) { }

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
    return this.invoke<DetectorResponse[]>(path, HttpMethod.POST, body).retry(1).map(response => response.map(detector => detector.metadata));
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
    let request = this._httpClient.post<string>(url, body, {
      headers: this._getHeaders(path, method)
    });

    return this._cacheService.get(this.getCacheKey(method, path), request, true);
  }

  public publishDetector(resourceId: string, author: string, packageToPublish: Package): Observable<any> {
    let path = `${resourceId}/diagnostics/publish`;
    return this.invoke<any>(path, HttpMethod.POST, packageToPublish, false, true, true, author);
  }

  public invoke<T>(path: string, method: HttpMethod = HttpMethod.GET, body: any = {}, useCache: boolean = true, invalidateCache: boolean = false, internalView: boolean = true, author: string = ""): Observable<T> {
    var url: string = `${this.diagnosticApi}api/invoke`

// <<<<<<< HEAD
//     let request = this._http.post(url, body, {
//       headers: this._getHeaders(path, method, internalView, author)
//     })
//       .map((response: Response) => <T>(response.json()));
// =======
    let request = this._httpClient.post<T>(url, body, {
      headers: this._getHeaders(path, method, internalView, author)
    });

    return useCache ? this._cacheService.get(this.getCacheKey(method, path), request, invalidateCache) : request;
  }

  private getCacheKey(method: HttpMethod, path: string) {
    return `${HttpMethod[method]}-${path}`;
  }

  public get<T>(path: string, invalidateCache: boolean = false): Observable<T> {

    var url: string = `${this.diagnosticApi}${path}`;

    let request = this._httpClient.get<T>(url, {
      headers: this._getHeaders()
    });

    return this._cacheService.get(path, request, invalidateCache);
  }

// <<<<<<< HEAD
//   private _getHeaders(path?: string, method?: HttpMethod, internalView: boolean = true, author: string = ""): Headers {
//     var headers = new Headers();
//     headers.append('Content-Type', 'application/json');
//     headers.append('Accept', 'application/json');
//     headers.append('Authorization', `Bearer ${this._authService.accessToken}`);
//     headers.append('x-ms-internal-client', String(true));
//     headers.append('x-ms-internal-view', String(internalView));

//     if (author !== "")
//     {
//       headers.append('x-ms-author', author);
//     }
// =======
  private _getHeaders(path?: string, method?: HttpMethod, internalView: boolean = true, author: string = ""): HttpHeaders {
    var headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Accept', 'application/json');
    headers = headers.set('x-ms-internal-client', String(true));
    headers = headers.set('x-ms-internal-view', String(internalView));
    headers = headers.set('Authorization', `Bearer ${this._adalService.userInfo.token}`)

    if (author !== "")
    {
      headers = headers.set('x-ms-author', author);
    }

    if (path) {
      headers = headers.set('x-ms-path-query', path);
    }

    if (method) {
      headers = headers.set('x-ms-method', HttpMethod[method]);
    }

    return headers;
  }

  private _getTimeQueryParameters(startTime: string, endTime: string) {
    return `&startTime=${startTime}&endTime=${endTime}`;
  }

  private _getSystemInvokerParameters(systemDataSource: string, timeRange: string) {
    return `&dataSource=${systemDataSource}&timeRange=${timeRange}`;
  }
}
