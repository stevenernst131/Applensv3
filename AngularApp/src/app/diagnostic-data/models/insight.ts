import { Dictionary } from "../utilities/extensions";
import { Rendering, DiagnosticData } from "./detector";

export class InsightBase {
    status: InsightStatus;
    title: string;

    constructor(status: string, title: string) {
        this.title = title;
        this.status = InsightStatus[status];
    }
}

export class Insight extends InsightBase {
    
    data: Dictionary<string>;

    showDetails: boolean = false;

    constructor(status: string, title: string) {
        super(status, title);
        this.data = {};
    }

    getKeys(): string[] {
        return Object.keys(this.data);
    }

    hasData(): boolean {
        return Object.keys(this.data).length > 0;
    }
}

export class DynamicInsight extends InsightBase {
    description: string;
    innerDiagnosticData: DiagnosticData;
    expanded: boolean;
}

export enum InsightStatus {
    Critical,
    Warning,
    Info,
    Success
}