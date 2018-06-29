import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { MainComponent } from './modules/main/main/main.component';
import { MainModule } from './modules/main/main.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StartupService } from './shared/services/startup.service';
import { ArmResource, ResourceServiceInputs } from './shared/models/resources';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

// @Injectable()
// export class ResourceTypeResolver implements Resolve<void>{
//   constructor(private _startupService: StartupService) { }

//   resolve(route: ActivatedRouteSnapshot): void {
//     console.log(route.params);
//     let armResource = <ArmResource>route.params;
//     this._startupService.setResource(armResource);
//   }
// }

@Injectable()
export class ValidResourceResolver implements Resolve<void>{
  constructor(private _startupService: StartupService, private _http: Http, private _router: Router) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    return this._http.get('assets/enabledResourceTypes.json').map(response => {
      let resource = <ArmResource>route.params;
      let type = `${resource.provider}/${resource.resourceTypeName}`

      if (response && response.json().enabledResourceTypes) {

        let enabledResourceTypes = <ResourceServiceInputs[]>response.json().enabledResourceTypes;
        let matchingResourceInputs = enabledResourceTypes.find(t => t.resourceType == type);
        matchingResourceInputs.armResource = resource;

        if (matchingResourceInputs) {
          this._startupService.setResource(matchingResourceInputs);
          return matchingResourceInputs;
        }
      }

      this._router.navigate(['/']);
      return `Resource Type '${type}' not enabled in Applens`;
    });
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
    path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/providers/:provider/:resourceTypeName/:resourceName',
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
    resolve: { validResources: ValidResourceResolver },
    data: {
      temp: 'test'
    }
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
    ValidResourceResolver,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
