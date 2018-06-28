import { StartupService } from "../services/startup.service";
import { ArmResource } from "../models/resources";
import { SiteService } from "../services/site.service";
import { AseService } from "../services/ase.service";
import { ResourceService } from "../services/resource.service";
import { ObserverService } from "../services/observer.service";

export let ResourceServiceFactory = (startupService: StartupService, observerService: ObserverService) => {
    let resource: ArmResource = startupService.getResourceInfo();
    let type = `${resource.provider}/${resource.resourceTypeName}`

    let service: ResourceService;

    switch (type) {
        case 'Microsoft.Web/hostingEnvironments':
            service = new AseService(observerService);
            service.initialize(resource);
            break;
        case 'Microsoft.Web/sites':
            service = new SiteService(observerService);
            service.initialize(resource);
            break;
        default:
            service = new ResourceService();
            service.initialize(resource);
            break;
    };

    return service;
};