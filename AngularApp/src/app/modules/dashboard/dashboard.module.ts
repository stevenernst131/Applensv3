import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { RouterModule, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { StartupService } from '../../shared/services/startup.service';
import { Observable } from 'rxjs/Observable';
import { SideNavComponent } from './side-nav/side-nav.component';
import { ResourceMenuItemComponent } from './resource-menu-item/resource-menu-item.component';
import { ResourceService } from '../../shared/services/resource.service';
import { ResourceServiceFactory } from '../../shared/providers/resource.service.provider';
import { SiteService } from '../../shared/services/site.service';
import { ResourceHomeComponent } from './resource-home/resource-home.component';
import { AseService } from '../../shared/services/ase.service';
import { SignalContainerComponent } from './signal-container/signal-container.component';
import { DiagnosticDataModule } from '../../diagnostic-data/diagnostic-data.module';

@Injectable()
export class InitResolver implements Resolve<Observable<boolean>>{
  constructor(private _startupService: StartupService, private _resourceService: ResourceService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    console.log("In resolve");
    return this._resourceService.setResourcePath(state.url.split('/'));
  }
}

export const DashboardModuleRoutes: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: DashboardComponent,
    resolve: { info: InitResolver },
    children: [
      {
        path: '',
        component: ResourceHomeComponent,
        pathMatch: 'full'
      },
      {
        path: 'signals/:signal',
        component: SignalContainerComponent
      }
    ]
  },

])

@NgModule({
  imports: [
    CommonModule,
    DashboardModuleRoutes,
    DiagnosticDataModule,
    SharedModule
  ],
  providers: [
    InitResolver,
    {
      provide: ResourceService,
      useFactory: ResourceServiceFactory,
      deps: [StartupService, SiteService, AseService]
    }
  ],
  declarations: [DashboardComponent, SideNavComponent, ResourceMenuItemComponent, ResourceHomeComponent, SignalContainerComponent]
})
export class DashboardModule { }
