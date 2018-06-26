import { NgModule, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { RouterModule, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS } from 'ng-pick-datetime';
import { AngularSplitModule } from 'angular-split';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { StartupService } from '../../shared/services/startup.service';
import { Observable } from 'rxjs/Observable';
import { SideNavComponent, SearchMenuPipe } from './side-nav/side-nav.component';
import { ResourceMenuItemComponent } from './resource-menu-item/resource-menu-item.component';
import { ResourceService } from '../../shared/services/resource.service';
import { ResourceServiceFactory } from '../../shared/providers/resource.service.provider';
import { SiteService } from '../../shared/services/site.service';
import { ResourceHomeComponent } from './resource-home/resource-home.component';
import { AseService } from '../../shared/services/ase.service';
import { SignalContainerComponent } from './signal-container/signal-container.component';
import { DiagnosticDataModule } from '../../diagnostic-data/diagnostic-data.module';
import { QueryParamsService } from '../../shared/services/query-params.service';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { CUSTOM_MOMENT_FORMATS } from '../../shared/models/datetime';
import { OnboardingFlowComponent } from './onboarding-flow/onboarding-flow.component';
import { ApplensDiagnosticService } from './services/applens-diagnostic.service';
import { DiagnosticService } from '../../diagnostic-data/services/diagnostic.service';
import { CollapsibleMenuModule } from '../../collapsible-menu/collapsible-menu.module';

@Injectable()
export class InitResolver implements Resolve<Observable<boolean>>{
  constructor(private _resourceService: ResourceService, private _queryParamService: QueryParamsService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this._queryParamService.setStartAndEndTime(route.queryParams['startTime'], route.queryParams['endTime']);
    let resourceRoute: string[] = state.url.split('?')[0].split('/');
    return this._resourceService.setResourcePath(resourceRoute);
  }
}

export const DashboardModuleRoutes: ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: DashboardComponent,
    resolve: { info: InitResolver },
    children: [
      {
        path: 'home',
        component: ResourceHomeComponent,
        pathMatch: 'full'
      },
      {
        path: 'create',
        component: OnboardingFlowComponent
      },
      {
        path: 'detectors/:signal',
        component: SignalContainerComponent
      },
      {
        path: 'detectors/:signal/edit',
        component: OnboardingFlowComponent        
      }
    ]
  },

]);

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DashboardModuleRoutes,
    DiagnosticDataModule.forRoot(),
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    OwlMomentDateTimeModule,
    MonacoEditorModule.forRoot(),
    AngularSplitModule,
    CollapsibleMenuModule
  ],
  providers: [
    ApplensDiagnosticService,
    InitResolver,
    {
      provide: ResourceService,
      useFactory: ResourceServiceFactory,
      deps: [StartupService, SiteService, AseService]
    },
    {
      provide: OWL_DATE_TIME_FORMATS, 
      useValue: CUSTOM_MOMENT_FORMATS
    },
    { provide: DiagnosticService, useExisting: ApplensDiagnosticService }
  ],
  declarations: [DashboardComponent, SideNavComponent, ResourceMenuItemComponent, ResourceHomeComponent, SignalContainerComponent, TimePickerComponent, OnboardingFlowComponent, SearchMenuPipe]
})
export class DashboardModule { }
