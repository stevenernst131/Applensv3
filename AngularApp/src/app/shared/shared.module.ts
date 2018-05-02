import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { DiagnosticApiService } from './services/diagnostic-api.service';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { HttpModule } from '@angular/http';
import { SiteService } from './services/site.service';
import { FormsModule } from '@angular/forms';
import { StartupService } from './services/startup.service';
import { ObserverService } from './services/observer.service';
import { GithubApiService } from './services/github-api.service';
import { AseService } from './services/ase.service';
import { CacheService } from './services/cache.service';
import { QueryParamsService } from './services/query-params.service';
import { ResourceService } from './services/resource.service';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    FormsModule
  ],
  declarations: [TreeViewComponent],
  exports: [TreeViewComponent]
})
export class SharedModule { 
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        DiagnosticApiService,
        SiteService,
        StartupService,
        ObserverService,
        GithubApiService,
        ResourceService,
        AseService,
        CacheService,
        QueryParamsService
      ]
    }
  }
}
