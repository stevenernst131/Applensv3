import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { MainComponent } from './modules/main/main/main.component';
import { MainModule } from './modules/main/main.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StartupService } from './shared/services/startup.service';

@Injectable()
export class ResourceTypeResolver implements Resolve<void>{
  constructor(private _startupService: StartupService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    let resourceRoute: string[] = state.url.split('?')[0].split('/');
    this._startupService.setResourceRoute(resourceRoute);
  }
}

export const Routes = RouterModule.forRoot([
  {
    path: '',
    component: MainComponent
  },
  {
    path: 'sites/:site',
    loadChildren: 'app/modules/site/site.module#SiteModule'
  },
  {
    path: 'hostingEnvironments/:hostingEnvironment',
    loadChildren: 'app/modules/ase/ase.module#AseModule'
  },
  {
    path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/sites/:site',
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
    resolve: { resource: ResourceTypeResolver }
  },
  {
    path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/sites/:site/slots/:slot',
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
    resolve: { resource: ResourceTypeResolver }
  },
  {
    path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/hostingEnvironments/:hostingEnvironment',
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
    resolve: { resource: ResourceTypeResolver }
  }
]);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    Routes,
    MainModule,
    SharedModule.forRoot()
  ],
  providers: [
    ResourceTypeResolver
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
