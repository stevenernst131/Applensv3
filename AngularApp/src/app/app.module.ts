import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { MainComponent } from './modules/main/main/main.component';
import { MainModule } from './modules/main/main.module';

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
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule'
  },
  {
    path: 'subscriptions/:subscriptionId/resourceGroups/:resourceGroup/hostingEnvironments/:hostingEnvironment',
    loadChildren: 'app/modules/dashboard/dashboard.module#DashboardModule'
  }
]);

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    Routes,
    MainModule,
    SharedModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
