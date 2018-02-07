import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeViewComponent } from './components/tree-view/tree-view.component';
import { SignalContainerComponent } from './components/signal-container/signal-container.component';
import { DiagnosticDataModule } from '../diagnostic-data/diagnostic-data.module';
import { DiagnosticApiService } from './services/diagnostic-api.service';
import { ModuleWithProviders } from '@angular/compiler/src/core';
import { HttpModule } from '@angular/http';
import { SiteService } from './services/site.service';
import { SideNavComponent } from './components/side-nav/side-nav.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    DiagnosticDataModule,
    HttpModule,
    FormsModule
  ],
  declarations: [TreeViewComponent, SignalContainerComponent, SideNavComponent],
  exports: [TreeViewComponent, SignalContainerComponent, SideNavComponent]
})
export class SharedModule { 
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        DiagnosticApiService,
        SiteService
      ]
    }
  }

}
