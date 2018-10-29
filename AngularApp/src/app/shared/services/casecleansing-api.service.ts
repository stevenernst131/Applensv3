import { Injectable } from '@angular/core';
import { DiagnosticApiService } from './diagnostic-api.service';
import {Package} from '../models/package';
import { Observable } from 'rxjs';

@Injectable()
export class CaseCleansingApiService {
  constructor(private _diagnosticApiService: DiagnosticApiService) { }

  public GetAllCases(): Observable<CaseSimple[]> {
    return this._diagnosticApiService.get<CaseSimple[]>('api/casecleansing/GetAllCases', true);
  }

  public GetCaseDetails(incidentId:string): Observable<object> {
    return this._diagnosticApiService.get<object>(`api/casecleansing/GetCase/${incidentId}`, true);
  }
}

export class CaseSimple{
  incidentId :string;
  time : Date;
  status : String;
  assignedTo : String;
  closedTime : Date;
  id : number;
  recomendationCount : number;
}
