import { Injectable } from '@angular/core';
import { ResourceService } from './resource.service';
import { ObserverService } from './observer.service';
import { ObserverAseInfo, ObserverAseResponse } from '../models/observer';
import { BehaviorSubject, Observable } from 'rxjs';
import { DiagnosticApiService } from './diagnostic-api.service';

@Injectable()
export class AseService extends ResourceService {

  private _currentResource: BehaviorSubject<ObserverAseInfo> = new BehaviorSubject(null);

  public readonly lensPrefix: string = 'ASE';
  public readonly imgSrc: string = 'assets/img/ASE-Logo.jpg';
  public readonly templateFileName: string = "Detector_HostingEnvironment";

  private _subscription: string;
  private _resourceGroup: string;
  private _hostingEnvironment: string;

  private _hostingEnvironmentResource: ObserverAseInfo;

  constructor(private _observerApiService: ObserverService, private _diagnosticApiService: DiagnosticApiService) {
    super();
  }

  // This method will be completed before loading dashboard component
  public setResourcePath(path: string[]): Observable<boolean> {
    this.processResourcePath(path);
    return this._observerApiService.getAse(this._hostingEnvironment)
      .flatMap((observerResponse: ObserverAseResponse) => {
        this._hostingEnvironmentResource = observerResponse.details;
        this._currentResource.next(observerResponse.details);
        return this._observerApiService.getAseRequestBody(this._hostingEnvironmentResource.Name);
      }).map((requestBody: any) => {
        this._diagnosticApiService.requestBody = requestBody.details;
        return true;
      });
  }

  public getCurrentResource(): Observable<ObserverAseInfo> {
    return this._currentResource;
  }

  public getResourceName(): string {
    return this._hostingEnvironment;
  }

  public getVersion(): string {
    return 'v2';
  }

  public getDiagnosticRoleQueryString(): string {
    return '';
  }

  public getCurrentResourceId(forDiagApi: boolean): string {
    return `subscriptions/${this._subscription}/resourcegroups/${this._resourceGroup}/providers/Microsoft.Web/hostingEnvironments/${this._hostingEnvironment}`;
  }

  private processResourcePath(path: string[]): void {
    this._subscription = path[path.indexOf('subscriptions') + 1];
    this._resourceGroup = path[path.indexOf('resourceGroups') + 1];
    this._hostingEnvironment = path[path.indexOf('hostingEnvironments') + 1];
  }

}
