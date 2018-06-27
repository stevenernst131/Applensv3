import { Injectable, Optional } from '@angular/core';
import { ResourceService } from './resource.service';
import { ObserverService } from './observer.service';
import { ObserverAseInfo, ObserverAseResponse } from '../models/observer';
import { BehaviorSubject, Observable } from 'rxjs';
import { DiagnosticApiService } from './diagnostic-api.service';
import { ArmResource } from '../models/resources';

@Injectable()
export class AseService extends ResourceService {

  private _currentResource: BehaviorSubject<ObserverAseInfo> = new BehaviorSubject(null);

  // private _subscription: string;
  // private _resourceGroup: string;
  // private _hostingEnvironment: string;

  private _hostingEnvironmentResource: ObserverAseInfo;

  constructor(private _observerApiService: ObserverService) {
    super();
  }

  public initialize(armResource: ArmResource){
    super.initialize(armResource, 'Detector_HostingEnvironment', 'ASE', 'assets/img/ASE-Logo.jpg', 'v2');
  }

  public startInitializationObservable() {
    this._observerApiService.getAse(this._armResource.resourceName)
      .flatMap((observerResponse: ObserverAseResponse) => {
        this._hostingEnvironmentResource = observerResponse.details;
        this._currentResource.next(observerResponse.details);
        return this._observerApiService.getAseRequestBody(this._hostingEnvironmentResource.Name);
      }).map((requestBody: any) => {
        this._requestBody = requestBody.details;
        this._initialized.next(true);
      });
  }

  // This method will be completed before loading dashboard component
  // public waitForInitialization(path: string[]): Observable<boolean> {
  //   return th
  // }

  public getCurrentResource(): Observable<ObserverAseInfo> {
    return this._currentResource;
  }

  // public getResourceName(): string {
  //   return this._hostingEnvironment;
  // }

  // public getCurrentResourceId(forDiagApi: boolean): string {
  //   return `subscriptions/${this._subscription}/resourcegroups/${this._resourceGroup}/providers/Microsoft.Web/hostingEnvironments/${this._hostingEnvironment}`;
  // }

  // private processResourcePath(path: string[]): void {
  //   this._subscription = path[path.indexOf('subscriptions') + 1];
  //   this._resourceGroup = path[path.indexOf('resourceGroups') + 1];
  //   this._hostingEnvironment = path[path.indexOf('hostingEnvironments') + 1];
  // }

}
