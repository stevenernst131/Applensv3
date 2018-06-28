import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ObserverSiteResponse, ObserverSiteInfo } from '../models/observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import { ResourceService } from './resource.service';
import { ObserverService } from './observer.service';
import { ArmResource } from '../models/resources';

@Injectable()
export class SiteService extends ResourceService {

  private _currentResource: BehaviorSubject<ObserverSiteInfo> = new BehaviorSubject(null);

  private _siteObject: ObserverSiteInfo;

  constructor(private _observerApiService: ObserverService) {
    super();
  }

  public initialize(armResource: ArmResource){
    super.initialize(armResource, 'Detector_WebApp', 'App', 'assets/img/Azure-WebApps-Logo.png', 'v4');
  }

  public startInitializationObservable() {
    this._initialized = this._observerApiService.getSite(this._armResource.resourceName)
      .flatMap((observerResponse: ObserverSiteResponse) => {
        this._siteObject = this.getSiteFromObserverResponse(observerResponse);
        this._currentResource.next(this._siteObject);
        return this._observerApiService.getSiteRequestBody(this._siteObject.SiteName, this._siteObject.InternalStampName);
      }).map((requestBody: any) => {
        if (!requestBody.details.HostNames) {
          requestBody.details.HostNames = this._siteObject.Hostnames.map(hostname => <any>{
            name: hostname,
            type: 0
          });
        }
        this._requestBody = requestBody.details;
        return true;
      });
  }

  public getCurrentResource(): Observable<any> {
    return this._currentResource;
  }

  private getSiteFromObserverResponse(observerResponse: ObserverSiteResponse): ObserverSiteInfo {
    return observerResponse.details.find(site =>
      site.Subscription.toLowerCase() === this._armResource.subscriptionId.toLowerCase() &&
      site.ResourceGroupName.toLowerCase() === this._armResource.resourceGroup.toLowerCase())
  }



}