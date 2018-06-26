import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export abstract class ResourceService {

  constructor() { }

  public abstract lensPrefix: string;
  public abstract imgSrc: string;

  public abstract templateFileName: string;

  public abstract setResourcePath(path: string[]): Observable<boolean>;

  public abstract getResourceName(): string;

  public abstract getCurrentResourceId(forDiagApi?: boolean): string;

  public abstract getCurrentResource(): Observable<any>;

  public abstract getDiagnosticRoleQueryString(): string;

  public abstract getVersion(): string;
}
