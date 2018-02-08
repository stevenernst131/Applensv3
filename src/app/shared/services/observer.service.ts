import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ObserverSiteResponse, ObserverSiteInfo } from '../models/observer';
import { DiagnosticApiService } from './diagnostic-api.service';

@Injectable()
export class ObserverService {

  constructor(private _diagnosticApiService: DiagnosticApiService) { }

  public getSite(site: string): Observable<ObserverSiteResponse> {
    return Observable.of(<ObserverSiteResponse>{"SiteName":"rteventservice","Details":[{"SiteName":"rteventservice","StampName":"waws-prod-bay-051","InternalStampName":"waws-prod-bay-051","Subscription":"1402be24-4f35-4ab7-a212-2cd496ebdf14","WebSpace":"rteventservice-WestUSwebspace","ResourceGroupName":"rteventservice","SlotName":""}],"HostNames":["rteventservice.azurewebsites.net","rteventservice.trafficmanager.net"]});
    // return this._diagnosticApiService.get<ObserverSiteResponse>(`api/sites/${site}`)
    //   .map(site => {
    //     site.Details.map(info => this.getSiteInfoWithSlot(info))
    //     return site;
    //   });
  }

  private getSiteInfoWithSlot(site: ObserverSiteInfo): ObserverSiteInfo {
    let siteName = site.SiteName;
    let slot = '';

    if (siteName.indexOf('(') > 0) {
      let split = site.SiteName.split('(')
      siteName = split[0];
      slot = split[1].replace(')', '');
    }

    site.SiteName = siteName;
    site.SlotName = slot;

    return site;
  }

}
