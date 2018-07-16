import {Injectable, Inject} from '@angular/core';
import { ITelemetryProvider} from './telemetry.common';
import { DIAGNOSTIC_DATA_CONFIG, DiagnosticDataConfig } from '../../config/diagnostic-data-config';
import { AppInsightsTelemetryService } from './appinsights-telemetry.service';
import { KustoTelemetryService } from './kusto-telemetry.service';

@Injectable()
export class TelemetryService {
    private telemetryProviders: ITelemetryProvider[] = [];

    constructor(private _appInsightsService: AppInsightsTelemetryService, private _kustoService: KustoTelemetryService, @Inject(DIAGNOSTIC_DATA_CONFIG) private config: DiagnosticDataConfig) {
        if (config.useKustoForTelemetry) {
            this.telemetryProviders.push(this._kustoService);
        }
        if (config.useAppInsightsForTelemetry) {
            this.telemetryProviders.push(this._appInsightsService)
        }
    }

    /**
     * Writes event to the registered logging providers.
     */
    public logEvent(
        eventMessage: string,
        measurements?: any,
        properties?: any) {

        try {
            for (var telemetryProvider of this.telemetryProviders) {
                telemetryProvider.logEvent(eventMessage, measurements, properties);
            }
        } catch (error) {
            try {
                console.error('Unexpected error occured while trying to write log entry:', error);
            } catch (_) {
            }
        }
    }

    public logPageView(name: string, url?: string, properties?: string, measurements?: string, duration?: number) {
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