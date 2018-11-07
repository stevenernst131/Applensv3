import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Communication } from '../models/communication';

@Injectable()
export class CommsService {

  constructor() { }

  public getServiceHealthCommunications(): Observable<Communication[]> {
    return null;
  }

  public openMoreDetails() {
  }
}
