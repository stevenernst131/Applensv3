import { Injectable } from '@angular/core';
import { DiagnosticApiService } from './diagnostic-api.service';
import { Observable } from 'rxjs';

@Injectable()
export class GithubApiService {

  constructor(private _diagnosticApiService: DiagnosticApiService) { }

  public getDetectorTemplate(): Observable<string> {
    return this._diagnosticApiService.get<string>(`api/github/detectortemplate`);
  }

  public getDetectorFile(id: string): Observable<string>{
    return this._diagnosticApiService.get<string>(`api/github/${id}`);
  }
}
