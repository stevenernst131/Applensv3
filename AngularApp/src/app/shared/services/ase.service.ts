import { Injectable, Inject } from '@angular/core';
import { ResourceService } from './resource.service';
import { ObserverService } from './observer.service';
import { ObserverAseInfo, ObserverAseResponse } from '../models/observer';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArmResource } from '../models/resources';

@Injectable()
export class AseService extends ResourceService {

  private _currentResource: BehaviorSubject<ObserverAseInfo> = new BehaviorSubject(null);

  private _hostingEnvironmentResource: ObserverAseInfo;

  constructor(private _observerApiService: ObserverService) {
    super();
  }

  public initialize(armResource: ArmResource){
    super.initialize(armResource, 'Detector_HostingEnvironment', 'ASE', 'assets/img/ASE-Logo.jpg', 'v2');
  }

  public startInitializationObservable() {
    this._initialized = this._observerApiService.getAse(this._armResource.resourceName)
      .flatMap((observerResponse: ObserverAseResponse) => {
        this._hostingEnvironmentResource = observerResponse.details;
        this._currentResource.next(observerResponse.details);
        return this._observerApiService.getAseRequestBody(this._hostingEnvironmentResource.Name);
      }).map((requestBody: any) => {
        this._requestBody = requestBody.details;
        return true;
      });
  }

  public getCurrentResource(): Observable<ObserverAseInfo> {
    return this._currentResource;
  }
}
