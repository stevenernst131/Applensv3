import { BrowserModule } from '@angular/platform-browser';
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Resolve, ActivatedRouteSnapshot, Router, UrlSerializer } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { MainComponent } from './modules/main/main/main.component';
import { MainModule } from './modules/main/main.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StartupService } from './shared/services/startup.service';
import { ArmResource, ResourceServiceInputs } from './shared/models/resources';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';
import { AadAuthGuard } from './shared/auth/aad-auth-guard.service';
import { LoginComponent } from './shared/components/login/login.component';
import { AdalService, AdalGuard, AdalInterceptor } from 'adal-angular4';
import { CustomUrlSerializerService } from './shared/services/custom-url-serializer.service';
import { CasecleansingModule } from './modules/casecleansing/casecleansing.module';

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

        if (matchingResourceInputs) {
          matchingResourceInputs.armResource = resource;
          this._startupService.setResource(matchingResourceInputs);
          return matchingResourceInputs;
        }
      }

      //TODO: below does not seem to work
      this._router.navigate(['/']);
      return `Resource Type '${type}' not enabled in Applens`;
    });
  }
}

export const Routes = RouterModule.forRoot([
  {
    path: '',
    canActivate: [AadAuthGuard],
    children: [
      {
        path: '',
        children: [
          {
            path: '',
            loadChildren: 'app/modules/main/main.module#MainModule'
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
            path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/:resourceTypeName/:resourceName',
            redirectTo: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/providers/Microsoft.Web/:resourceTypeName/:resourceName'
          },
          {
            path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/providers/:provider/:resourceTypeName/:resourceName',
            loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule',
            resolve: { validResources: ValidResourceResolver }
          },
          {
            path: 'caseCleansing',
            loadChildren: 'app/modules/casecleansing/casecleansing.module#CasecleansingModule'
          }
        ]
      }
    ]
  },
  {
    path: 'login',
    component: LoginComponent
  }
]);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    Routes,
    SharedModule.forRoot()
  ],
  providers: [
    ValidResourceResolver,
    AdalService,
    {
      provide: UrlSerializer,
      useClass: CustomUrlSerializerService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
