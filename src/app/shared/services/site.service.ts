import { Injectable } from '@angular/core';
import { DiagnosticApiService } from './diagnostic-api.service';
import { Observable } from 'rxjs/Observable';
import { ObserverSiteResponse } from '../models/observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class SiteService {

  public currentResource: BehaviorSubject<ObserverSiteResponse> = new BehaviorSubject(null)

  constructor(private _diagnosticApiService: DiagnosticApiService) { }

  public getSite(site: string): Observable<ObserverSiteResponse> {
    return this._diagnosticApiService.get<ObserverSiteResponse>(`api/sites/${site}`)
          .map(site => {
            this.currentResource.next(site);
            return site;
          });
  }

}
