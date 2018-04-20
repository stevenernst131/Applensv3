import { Dictionary } from "./extensions";

export enum ResourceType {
    Site,
    Function,
    AppServiceEnvironment,
    HDInsight
}

export interface ResourceTypeState {
    displayName: string;
    routeName: string;
    resourceType: ResourceType,
    enabled: boolean;
}

export interface ActivatedResource {
    type: ResourceType,
    resourceDefinition: Dictionary<string>
}