import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { SharedModule } from '../../shared/shared.module';
import { DiagnosticDataModule } from '../../diagnostic-data/diagnostic-data.module';

export const MainModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: MainComponent
  }
])


@NgModule({
  imports: [
    CommonModule,
    MainModuleRoutes,
    SharedModule,
    DiagnosticDataModule
  ],
  declarations: [MainComponent]
})
export class MainModule { }
