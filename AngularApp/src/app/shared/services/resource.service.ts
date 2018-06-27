import { Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ArmResource } from '../models/resources';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class ResourceService {

  public lensPrefix: string;
  public imgSrc: string;
  public versionPrefix: string;
  public templateFileName: string;

  protected _requestBody: any = null;
  protected _armResource: ArmResource;
  protected _initialized: BehaviorSubject<boolean> = new BehaviorSubject(null);

  constructor() { }

  initialize(armResource: ArmResource, templateFileName: string = '', lensPrefix: string = 'App', imgSrc: string = '', versionPrefix: string = '') {
    this._armResource = armResource;
    this.templateFileName = templateFileName;
    this.lensPrefix = lensPrefix;
    this.imgSrc = imgSrc;
    this.versionPrefix = versionPrefix;

    this.startInitializationObservable();
  }

  public startInitializationObservable() {
    this._initialized.next(true);
  }

  public waitForInitialization(): Observable<boolean> {
    
    return this._initialized;
  }

  public getResourceName(): string {
    return this._armResource.resourceName;
  }

  public getCurrentResourceId(forDiagApi?: boolean): string {
    return `subscriptions/${this._armResource.subscriptionId}/resourcegroups/${this._armResource.resourceGroup}/providers/${this._armResource.provider}` + 
      `/${this._armResource.resourceTypeName}${this.getResourceName}`;
  }

  public getCurrentResource(): Observable<any> {
    return Observable.of(this._armResource);
  }

  public getRequestBody(): any {
    return this._requestBody;
  }
}
