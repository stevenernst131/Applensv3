import { Injectable } from '@angular/core';
import { DiagnosticApiService } from './diagnostic-api.service';
import { Observable } from 'rxjs/Observable';
import { ObserverSiteResponse, ObserverSiteInfo } from '../models/observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import { ResourceService } from './resource.service';
import { ObserverService } from './observer.service';

@Injectable()
export class SiteService extends ResourceService {

  private _currentResource: BehaviorSubject<ObserverSiteInfo> = new BehaviorSubject(null);

  public readonly lensPrefix: string = 'App';
  public readonly imgSrc: string = 'assets/img/Azure-WebApps-Logo.png';
  public readonly templateFileName: string = "Detector_WebApp";

  private _subscription: string;
  private _resourceGroup: string;
  private _siteName: string;
  private _slotName: string;
  private _isStagingSlot: boolean;
  private _hostnames: string[];

  private _siteObject: ObserverSiteInfo;

  constructor(private _diagnosticApiService: DiagnosticApiService, private _observerApiService: ObserverService) {
    super();
  }

  // This method will be completed before loading dashboard component
  public setResourcePath(path: string[]): Observable<boolean> {
    this.processResourcePath(path);
    return this._observerApiService.getSite(this._siteName)
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
        this._diagnosticApiService.requestBody = requestBody.details;
        return true;
      });
  }

  public getDiagnosticRoleQueryString(): string {
    return `stampName=${this._siteObject.InternalStampName}${this._siteObject.Hostnames.map(hostname => `&hostnames=${hostname}`).join('')}`;
  }

  public getResourceName(): string {
    return this._siteName;
  }

  public getCurrentResource(): Observable<ObserverSiteInfo> {
    return this._currentResource;
  }

  public getVersion(): string {
    return 'v4';
  }

  public getCurrentResourceId(forDiagApi: boolean = false): string {
    let siteId = `subscriptions/${this._subscription}/resourcegroups/${this._resourceGroup}/providers/Microsoft.Web/sites/${this._siteName}`;
    if (this._isStagingSlot) {
      siteId += forDiagApi ? `(${this._slotName})` : `/slots/${this._slotName}`;
    }
    return siteId;
  }

  private processResourcePath(path: string[]): void {
    this._subscription = path[path.indexOf('subscriptions') + 1];
    this._resourceGroup = path[path.indexOf('resourceGroups') + 1];
    this._siteName = path[path.indexOf('sites') + 1];
    this._slotName = path.indexOf('slots') > 0 ? path[path.indexOf('slots') + 1] : '';
    this._isStagingSlot = path.indexOf('slots') > 0;
  }

  private getSiteFromObserverResponse(observerResponse: ObserverSiteResponse): ObserverSiteInfo {
    return observerResponse.details.find(site =>
      site.Subscription.toLowerCase() === this._subscription.toLowerCase() &&
      site.ResourceGroupName.toLowerCase() === this._resourceGroup.toLowerCase())
  }



}