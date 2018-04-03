import { Injectable } from '@angular/core';
import { ResourceService } from './resource.service';
import { ObserverService } from './observer.service';
import { ObserverAseInfo, ObserverAseResponse } from '../models/observer';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class AseService extends ResourceService {

  private _currentResource: BehaviorSubject<ObserverAseInfo> = new BehaviorSubject(null);

  public readonly lensPrefix: string = 'ASE';
  public readonly imgSrc: string = 'assets/img/ASE-Logo.jpg';

  private _subscription: string;
  private _resourceGroup: string;
  private _hostingEnvironment: string;

  constructor(private _observerApiService: ObserverService) {
    super();
  }

  public setResourcePath(path: string[]): Observable<boolean> {
    this.processResourcePath(path);
    return this._observerApiService.getAse(this._hostingEnvironment)
      .map((observerResponse: ObserverAseResponse) => {
        this._currentResource.next(observerResponse.details);
        return true;
      });
  }

  public getCurrentResource(): Observable<ObserverAseInfo> {
    return this._currentResource;
  }

  public getResourceName(): string {
    return this._hostingEnvironment;
  }

  public getDiagnosticRoleQueryString(): string {
    return '';
  }

  public getCurrentResourceId(): string {
    return '';
  }

  private processResourcePath(path: string[]): void {
    this._subscription = path[path.indexOf('subscriptions') + 1];
    this._resourceGroup = path[path.indexOf('resourceGroups') + 1];
    this._hostingEnvironment = path[path.indexOf('hostingEnvironments') + 1];
  }

}
