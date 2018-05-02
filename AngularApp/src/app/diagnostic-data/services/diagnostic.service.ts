import { Observable } from "rxjs/Observable";
import { Injectable } from "@angular/core";
import { ResourceService } from "../../shared/services/resource.service";
import { DetectorResponse } from "../models/detector";

@Injectable()
export abstract class DiagnosticService {
    public abstract getDetector(detector: string): Observable<DetectorResponse>;
}