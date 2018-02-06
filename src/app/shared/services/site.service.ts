import { Injectable } from '@angular/core';
import { DiagnosticApiService } from './diagnostic-api.service';
import { Observable } from 'rxjs/Observable';
import { ObserverSiteResponse } from '../models/observer';

@Injectable()
export class SiteService {

  constructor(private _diagnosticApiService: DiagnosticApiService) { }

  public getSite(site: string): Observable<ObserverSiteResponse> {
    return this._diagnosticApiService.get<ObserverSiteResponse>(`api/sites/${site}`);
  }

}
