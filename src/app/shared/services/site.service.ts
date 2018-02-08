import { Injectable } from '@angular/core';
import { DiagnosticApiService } from './diagnostic-api.service';
import { Observable } from 'rxjs/Observable';
import { ObserverSiteResponse, ObserverSiteInfo } from '../models/observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import 'rxjs/add/observable/of';
import { ActivatedResource, ResourceType } from '../models/resources';
import { ResourceService } from './resource.service';

@Injectable()
export class SiteService extends ResourceService {

  public currentResource: BehaviorSubject<ObserverSiteResponse> = new BehaviorSubject(null);

  public readonly lensPrefix: string = 'App';
  public readonly imgSrc: string = 'assets/img/Azure-WebApps-Logo.png';

  private _subscription: string;
  private _resourceGroup: string;
  private _siteName: string;
  private _slotName: string;
  private _isStagingSlot: boolean;

  constructor(private _diagnosticApiService: DiagnosticApiService) {
    super();
  }

  public setResourcePath(path: string[]): void {
    this.processResourcePath(path);
  }

  public getResourceName(resourceUri: string): string {
    return this._isStagingSlot ? `${this._siteName}(${this._slotName})`: this._siteName;
  }

  private processResourcePath(path: string[]): void {
    this._subscription = path[path.indexOf('subscriptions') + 1];
    this._resourceGroup = path[path.indexOf('resourceGroups') + 1];
    this._siteName = path[path.indexOf('sites') + 1];
    this._slotName = path.indexOf('slots') > 0 ? path[path.indexOf('slots') + 1]: '';
    this._isStagingSlot = path.indexOf('slots') > 0;
  }

  

}