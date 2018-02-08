import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { SharedModule } from '../../shared/shared.module';
import { DiagnosticDataModule } from '../../diagnostic-data/diagnostic-data.module';
import { FormsModule } from '@angular/forms';

export const MainModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: MainComponent
  }
])

/*
 * If possible do no import SharedModule to this module
 * This will mean that we don't have to initialize that module to start up the app 
 */

@NgModule({
  imports: [
    CommonModule,
    MainModuleRoutes,
    DiagnosticDataModule,
    FormsModule
  ],
  declarations: [MainComponent]
})
export class MainModule { }
