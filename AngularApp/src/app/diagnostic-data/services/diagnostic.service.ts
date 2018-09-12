import { Observable } from "rxjs/Observable";
import { Injectable } from "@angular/core";
import { ResourceService } from "../../shared/services/resource.service";
import { DetectorResponse, DetectorMetaData } from "../models/detector";

@Injectable()
export class DiagnosticService {
    //TODO: Figure out if this can be done with an abstract class
    // Ran into difficulties in Support Center when this was abstract
    // This class is never supposed to be used directly
    // In applens we provide this withValue: applens-diagnostics.service
    // In Support Center we provide this withValue: generic-api.service

    public getDetector(detector: string, startTime: string, endTime: string, refresh?: boolean, internalView?: boolean): Observable<DetectorResponse> {
        return null;
    }

    public getDetectors(): Observable<DetectorMetaData[]> {
        return null;
    }
}
