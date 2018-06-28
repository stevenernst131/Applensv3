import { Injectable } from '@angular/core';
import { ActivatedResource, ResourceType, ArmResource } from '../models/resources';

@Injectable()
export class StartupService {

  private _armResource: ArmResource;

  constructor() { }

  public getResourceInfo(): ArmResource {
    return this._armResource;
  }

  public setResource(resource: ArmResource) {
    this._armResource = resource;
  }
}
