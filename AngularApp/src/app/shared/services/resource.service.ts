import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ArmResource, ResourceServiceInputs, RESOURCE_SERVICE_INPUTS } from '../models/resources';

@Injectable()
export class ResourceService {

  public imgSrc: string;
  public versionPrefix: string;
  public templateFileName: string;

  protected _requestBody: any = null;
  protected _armResource: ArmResource;
  protected _initialized: Observable<boolean>;

  constructor(@Inject(RESOURCE_SERVICE_INPUTS) inputs: ResourceServiceInputs)  { 
    this._armResource = inputs.armResource;
    this.templateFileName = inputs.templateFileName;
    this.imgSrc = inputs.imgSrc;
    this.versionPrefix = inputs.versionPrefix;
  }

  public startInitializationObservable() {
    this._initialized = Observable.of(true);
  }

  public waitForInitialization(): Observable<boolean> {
    return this._initialized;
  }

  public getResourceName(): string {
    return this._armResource.resourceName;
  }

  public getCurrentResourceId(forDiagApi?: boolean): string {
    return `subscriptions/${this._armResource.subscriptionId}/resourcegroups/${this._armResource.resourceGroup}/providers/${this._armResource.provider}/${this._armResource.resourceTypeName}/${this._armResource.resourceName}`;
  }

  public getCurrentResource(): Observable<any> {
    return Observable.of(this._armResource);
  }

  public getRequestBody(): any {
    return this._requestBody;
  }
}
