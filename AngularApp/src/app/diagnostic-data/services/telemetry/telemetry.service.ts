import { Injectable, OnInit, Inject } from '@angular/core';
import { TelemetryEventNames, ITelemetryProvider } from './telemetry.common';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';
import { AppInsightsTelemetryService } from './appinsights-telemetry.service';
import { KustoTelemetryService } from './kusto-telemetry.service';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class TelemetryService {
    private telemetryProviders: ITelemetryProvider[] = [];
    private commonDetectorEventProperties: { [name: string]: string };
    eventPropertiesSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private eventPropertiesLocalCopy: { [name: string]: string } = {};

    constructor(private _appInsightsService: AppInsightsTelemetryService, private _kustoService: KustoTelemetryService, @Inject(DIAGNOSTIC_DATA_CONFIG) private config: DiagnosticDataConfig) {
        if (config.useKustoForTelemetry) {
            this.telemetryProviders.push(this._kustoService);
        }
        if (config.useAppInsightsForTelemetry) {
            this.telemetryProviders.push(this._appInsightsService);
        }

        this.eventPropertiesSubject.subscribe((data: any) => {
            for (let id in data) {
                this.eventPropertiesLocalCopy[id] = String(data[id]);
            }
        });
    }

    /**
     * Writes event to the registered logging providers.
     */
    public logEvent(
        eventMessage: string,
        properties: { [name: string]: string },
        measurements?: any) {
        if (this.eventPropertiesLocalCopy) {
            for (let id in this.eventPropertiesLocalCopy) {
                properties[id] = String(this.eventPropertiesLocalCopy[id]);
            }
        }

        for (var telemetryProvider of this.telemetryProviders) {
            telemetryProvider.logEvent(eventMessage, properties, measurements);
        }
    }

    public logPageView(name: string, properties?: any, measurements?: any, url?: string, duration?: number) {
        for (var telemetryProvider of this.telemetryProviders) {
            telemetryProvider.logPageView(name, url, properties, measurements, duration);
        }
    }

    public logException(exception: Error, handledAt?: string, properties?: any, measurements?: any, severityLevel?: AI.SeverityLevel) {
        for (var telemetryProvider of this.telemetryProviders) {
            telemetryProvider.logException(exception, handledAt, properties, measurements, severityLevel);
        }
    }

    public logTrace(message: string, customProperties?: any, customMetrics?: any) {
        for (var telemetryProvider of this.telemetryProviders) {
            telemetryProvider.logTrace(message, customProperties);
        }
    }

    public logMetric(name: string, average: number, sampleCount?: number, min?: number, max?: number, properties?: any) {
        for (var telemetryProvider of this.telemetryProviders) {
            telemetryProvider.logMetric(name, average, sampleCount, min, max, properties);
        }
    }
}