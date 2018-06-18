import { InjectionToken } from "@angular/core";

export interface DiagnosticDataConfig {
    isPublic: boolean;
}

export const INTERNAL_CONFIGURATION: DiagnosticDataConfig = {
    isPublic: false
}

export const PUBLIC_CONFIGURATION: DiagnosticDataConfig = {
    isPublic: true
}

export const DIAGNOSTIC_DATA_CONFIG = new InjectionToken<DiagnosticDataConfig>('app.config');