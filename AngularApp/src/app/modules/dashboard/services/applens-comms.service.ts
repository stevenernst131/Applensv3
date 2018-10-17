import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Communication } from '../../../diagnostic-data/models/communication';
import { DiagnosticApiService } from '../../../shared/services/diagnostic-api.service';
import { ResourceService } from '../../../shared/services/resource.service';

@Injectable()
export class ApplensCommsService {

  constructor(private _diagnosticApi: DiagnosticApiService, private _resourceService: ResourceService) { }

  public getServiceHealthCommunications(): Observable<Communication[]> {

    return this._resourceService.getCurrentResource().flatMap((data: any) => {
      let subId = data.subscriptionId;
      if (data.Subscription) {
        subId = data.Subscription;
      }
      return this._diagnosticApi.get<Communication[]>(`api/comms/${subId}`);
    });
  }

  public openMoreDetails() {
  }
}
