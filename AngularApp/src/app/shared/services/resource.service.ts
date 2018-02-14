import { Injectable } from '@angular/core';
import { ActivatedResource, ResourceType } from '../models/resources';
import { Observable } from 'rxjs/Observable';

@Injectable()
export abstract class ResourceService {

  constructor() { }

  public abstract lensPrefix: string;
  public abstract imgSrc: string;

  public abstract setResourcePath(path: string[]): void;

  public abstract getResourceName(): string;

  public abstract getCurrentResourceId(): string;

  public abstract getCurrentResource(): Observable<any>;
}
