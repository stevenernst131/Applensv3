import { InjectionToken } from "@angular/core";

export interface DiagnosticDataConfig {
    isPublic: boolean;
    useKustoForTelemetry?: boolean;
    useAppInsightsForTelemetry?: boolean;
    developingInstrumentationKey?: string;
    productionInstrumentationKey?: string;
}

export const INTERNAL_CONFIGURATION: DiagnosticDataConfig = {
    isPublic: false,
    useKustoForTelemetry: false,
    useAppInsightsForTelemetry: true,
    developingInstrumentationKey: '0f12994c-a067-4841-bd77-3b082f8ed3de',   //Application Insight resource: applenslogging
    productionInstrumentationKey: '48ab2838-0cc5-44b4-8504-f5e4b8ee3c72'   // Application Insight resource: applensloggingprod
}

export const PUBLIC_CONFIGURATION: DiagnosticDataConfig = {
    isPublic: true,
    useKustoForTelemetry: false,
    useAppInsightsForTelemetry: true,
    developingInstrumentationKey: 'a4eccd35-91b2-41c9-884b-b44e7e8590f7', //Application Insight resource: supportcenterlogging
    productionInstrumentationKey: 'c182b26a-f21a-4ae7-86db-b26dc1b2cab9' //Application Insight resource: supportcenterloggingprod
}

export const DIAGNOSTIC_DATA_CONFIG = new InjectionToken<DiagnosticDataConfig>('app.config');