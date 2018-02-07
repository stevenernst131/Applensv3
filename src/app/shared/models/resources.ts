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