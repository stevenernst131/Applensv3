import { Injectable } from '@angular/core';
import { ActivatedResource, ResourceType } from '../models/resources';

@Injectable()
export class StartupService {

  public useAct
  private _activatedResource: ActivatedResource;
  private _resourceType: ResourceType;
  private _resourceRoute: string[];

  constructor() { }

  public getResourceType() {
    return this._resourceType;
  }

  public setResourceRoute(resourceRoute: string[]) {
    this._resourceRoute = resourceRoute;
    this.determineResourceType(this._resourceRoute);
  }

  public getResourceRoute(): string[] {
    return this._resourceRoute;
  }

  private determineResourceType(resourceRoute: string[]): void {
    let type: ResourceType;
    if (resourceRoute[5].toLowerCase() == 'sites') {
      type = ResourceType.Site;
    }

    this._resourceType = type;
  }

}
