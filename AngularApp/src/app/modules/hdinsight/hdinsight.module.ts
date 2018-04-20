import { NgModule,ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HdiLandingComponent } from './hdi-landing/hdi-landing.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';

export const HDIModuleRoutes : ModuleWithProviders = RouterModule.forChild([
  {
    path: '',
    component: HdiLandingComponent
  }
]);

@NgModule({
  imports: [
    CommonModule,
    HDIModuleRoutes,
    SharedModule
  ],
  declarations: [HdiLandingComponent]
})
export class HdinsightModule { }
