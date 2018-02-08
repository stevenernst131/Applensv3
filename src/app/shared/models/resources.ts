import { Dictionary } from "./extensions";

export enum ResourceType {
    Site,
    Function,
    AppServiceEnvironment
}

export interface ResourceTypeState {
    displayName: string;
    resourceType: ResourceType,
    enabled: boolean;
}

export interface ActivatedResource {
    type: ResourceType,
    resourceDefinition: Dictionary<string>
}