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
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { StartupService } from '../../shared/services/startup.service';
import { Observable } from 'rxjs';
import { SideNavComponent, SearchMenuPipe } from './side-nav/side-nav.component';
import { ResourceMenuItemComponent } from './resource-menu-item/resource-menu-item.component';
import { ResourceService } from '../../shared/services/resource.service';
import { ResourceServiceFactory } from '../../shared/providers/resource.service.provider';
import { ResourceHomeComponent } from './resource-home/resource-home.component';
import { DiagnosticDataModule } from '../../diagnostic-data/diagnostic-data.module';
import { OwlMomentDateTimeModule } from 'ng-pick-datetime-moment';
import { CUSTOM_MOMENT_FORMATS } from '../../shared/models/datetime';
import { OnboardingFlowComponent } from './onboarding-flow/onboarding-flow.component';
import { TabCommonComponent } from './tabs/tab-common/tab-common.component';
import { TabDataComponent } from './tabs/tab-data/tab-data.component';
import { TabDevelopComponent } from './tabs/tab-develop/tab-develop.component';
import { ApplensDiagnosticService } from './services/applens-diagnostic.service';
import { ApplensCommsService } from './services/applens-comms.service';
import { DiagnosticService } from '../../diagnostic-data/services/diagnostic.service';
import { CommsService } from '../../diagnostic-data/services/comms.service';
import { CollapsibleMenuModule } from '../../collapsible-menu/collapsible-menu.module';
import { ObserverService } from '../../shared/services/observer.service';
import { TabDataSourcesComponent } from './tabs/tab-data-sources/tab-data-sources.component';
import { TabMonitoringComponent } from './tabs/tab-monitoring/tab-monitoring.component';
import { TabMonitoringDevelopComponent } from './tabs/tab-monitoring-develop/tab-monitoring-develop.component';
import { TabAnalyticsDevelopComponent } from './tabs/tab-analytics-develop/tab-analytics-develop.component';
import { TabAnalyticsDashboardComponent } from './tabs/tab-analytics-dashboard/tab-analytics-dashboard.component';
import { DetectorControlService } from '../../diagnostic-data/services/detector-control.service';

@Injectable()
export class InitResolver implements Resolve<Observable<boolean>>{
  constructor(private _resourceService: ResourceService, private _detectorControlService: DetectorControlService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    this._detectorControlService.setCustomStartEnd(route.queryParams['startTime'], route.queryParams['endTime']);
    return this._resourceService.waitForInitialization();
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
        redirectTo: 'home'
      },
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
        path: 'detectors/:detector',
        component: TabCommonComponent,
        children: [
          {
            path: '',
            component: TabDataComponent
          },
          {
            path: 'data',
            redirectTo: ''
          },
          {
            path: 'edit',
            component: TabDevelopComponent
          }
          ,
          {
            path: 'datasource',
            component: TabDataSourcesComponent
          }
          ,
          {
            path: 'monitoring',
            component: TabMonitoringComponent
          }          
          ,
          {
            path: 'analytics',
            component: TabAnalyticsDashboardComponent
          }
          ,
          {
            path: 'monitoring/edit',
            component: TabMonitoringDevelopComponent
          }
          ,
          {
            path: 'analytics/edit',
            component: TabAnalyticsDevelopComponent
          }
        ]
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
    CollapsibleMenuModule,
    NgxSmartModalModule.forRoot()
  ],
  providers: [
    ApplensDiagnosticService,
    ApplensCommsService,
    InitResolver,
    {
      provide: ResourceService,
      useFactory: ResourceServiceFactory,
      deps: [StartupService, ObserverService]
    },
    {
      provide: OWL_DATE_TIME_FORMATS,
      useValue: CUSTOM_MOMENT_FORMATS
    },
    { provide: DiagnosticService, useExisting: ApplensDiagnosticService },
    { provide: CommsService, useExisting: ApplensCommsService }
  ],
  declarations: [DashboardComponent, SideNavComponent, ResourceMenuItemComponent, ResourceHomeComponent, OnboardingFlowComponent, SearchMenuPipe, TabDataComponent, TabDevelopComponent, TabCommonComponent, TabDataSourcesComponent, TabMonitoringComponent, TabMonitoringDevelopComponent, TabAnalyticsDevelopComponent, TabAnalyticsDashboardComponent]
})
export class DashboardModule { }
