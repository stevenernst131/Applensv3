import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';

@Injectable()
export class DiagnosticApiService {

  public readonly diagnosticApi: string = "http://localhost:29141";

  constructor(private _http: Http) { }

  public invoke<T>(path: string): Observable<T> {
    var url: string = `${this.diagnosticApi}/api/invoke`

    return this._http.get(url, {
      headers: this._getHeaders(path)
    })
      .map((response: Response) => <T>(response.json()));
  }

  public get<T>(path: string): Observable<T> {
    

    var url: string = `${this.diagnosticApi}/${path}`;

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
