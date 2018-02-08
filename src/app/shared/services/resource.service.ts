import { Injectable } from '@angular/core';
import { ActivatedResource, ResourceType } from '../models/resources';

@Injectable()
export abstract class ResourceService {

  constructor() { }

  public abstract lensPrefix: string;
  public abstract imgSrc: string;

  public abstract setResourcePath(path: string[]): void;

  public abstract getResourceName(resourceUri: string): string;
}
