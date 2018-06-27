import { Injectable } from '@angular/core';
import { ActivatedResource, ResourceType, ArmResource } from '../models/resources';

@Injectable()
export class StartupService {

  // public useAct
  // private _activatedResource: ActivatedResource;
  // private _resourceType: string;
  // private _resourceRoute: string[];

  private _armResource: ArmResource;

  constructor() { }

  public getResourceInfo(): ArmResource {
    return this._armResource;
  }

  // public setResourceRoute(resourceRoute: string[]) {
  //   this._resourceRoute = resourceRoute;
  //   this.determineResourceType(this._resourceRoute);
  // }

  public setResource(resource: ArmResource) {
    this._armResource = resource;
    // this._resourceType = `${this._armResource.provider}/${this._armResource.resourceTypeName}`;
  }

  // private determineResourceType(resourceRoute: string[]): void {
  //   let type: ResourceType;
  //   if (resourceRoute.indexOf('sites') > 0) {
  //     type = ResourceType.Site;
  //   }
  //   else if (resourceRoute.indexOf('hostingEnvironments') > 0) {
  //     type = ResourceType.AppServiceEnvironment;
  //   }

  //   //this._resourceType = type;
  // }

}
