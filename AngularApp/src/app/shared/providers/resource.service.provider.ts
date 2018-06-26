import { StartupService } from "../services/startup.service";
import { ResourceType } from "../models/resources";
import { SiteService } from "../services/site.service";
import { AseService } from "../services/ase.service";

export let ResourceServiceFactory = (startupService: StartupService, siteService: SiteService, aseService: AseService) => {
    let type: ResourceType = startupService.getResourceType();

    switch (type) {
        case ResourceType.AppServiceEnvironment:
            return aseService;
        case ResourceType.Site:
        default:
            return siteService;
    };
};