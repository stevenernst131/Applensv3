import { Dictionary } from "./extensions";
import { InjectionToken } from "@angular/core";

export enum ResourceType {
    Site,
    Function,
    AppServiceEnvironment
}

export interface ResourceTypeState {
    displayName: string;
    routeName: Function;
    resourceType: ResourceType;
    enabled: boolean;
    caseId: boolean;
}

export interface ActivatedResource {
    type: ResourceType,
    resourceDefinition: Dictionary<string>
}

export interface ArmResource {
    subscriptionId: string;
    resourceGroup: string;
    provider: string;
    resourceTypeName: string;
    resourceName: string;
}

export interface ResourceServiceInputs {
    resourceType: string;
    templateFileName: string;
    imgSrc: string;
    versionPrefix: string;
    service: string;
    armResource: ArmResource;
}

export const RESOURCE_SERVICE_INPUTS = new InjectionToken<ResourceServiceInputs>('ResourceServiceInputs');

export const DEFAULT_RESOURCE_SERVICE_INPUTS: ResourceServiceInputs = {
    resourceType: '',
    imgSrc: '',
    service: '',
    templateFileName: '',
    versionPrefix: '',
    armResource: null
}